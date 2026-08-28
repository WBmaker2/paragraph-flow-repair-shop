import { describe, expect, it } from "vitest";
import {
  createInitialSessionState,
  sessionReducer,
  type SessionAction,
} from "./sessionReducer";

const validAction = {
  type: "SET_FIRST_JUDGMENT",
  missionIndex: 0,
  judgment: "needs-repair",
  revision: 0,
} as const;

function startToRead() {
  return sessionReducer(createInitialSessionState(), { type: "START_SESSION" });
}

describe("세션 reducer", () => {
  it("초기 상태는 INTRO이고 6개 미션 기록을 revision 0으로 만든다", () => {
    const state = createInitialSessionState();
    expect(state.step).toBe("INTRO");
    expect(state.missionIndex).toBe(0);
    expect(state.phase).toBe("active");
    expect(state.records).toHaveLength(6);
    expect(state.records.map((r) => r.revision)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("START_SESSION은 INTRO에서만 READ로 간다", () => {
    expect(startToRead()).toMatchObject({ step: "READ", missionIndex: 0 });
    expect(sessionReducer(startToRead(), { type: "START_SESSION" }).step).toBe("READ");
  });

  it("필수 응답 없이는 다음 단계로 가지 않는다", () => {
    const read = startToRead();
    expect(sessionReducer(read, { type: "ADVANCE" })).toBe(read);

    const judged = sessionReducer(read, validAction);
    const advanced = sessionReducer(judged, { type: "ADVANCE" });
    expect(advanced.step).toBe("TOPIC");
  });

  it("정의된 전이표만 통과시킨다", () => {
    let state = startToRead();
    const steps: string[] = ["READ"];
    state = sessionReducer(state, validAction);
    state = sessionReducer(state, { type: "ADVANCE" });
    steps.push(state.step);
    state = sessionReducer(state, {
      type: "SET_TOPIC",
      missionIndex: 0,
      sentenceId: "G1",
      revision: 1,
    });
    state = sessionReducer(state, { type: "ADVANCE" });
    steps.push(state.step);
    expect(steps).toEqual(["READ", "TOPIC", "ORDER"]);
    expect(state.missionIndex).toBe(0);
  });

  it("이전 revision의 응답은 상태를 바꾸지 않는다", () => {
    const read = startToRead();
    const applied = sessionReducer(read, validAction);
    expect(applied.records[0]!.revision).toBe(1);

    const stale = sessionReducer(applied, { ...validAction, judgment: "natural", revision: 0 });
    expect(stale).toBe(applied);

    const future = sessionReducer(applied, { ...validAction, judgment: "natural", revision: 9 });
    expect(future).toBe(applied);

    const current = sessionReducer(applied, { ...validAction, judgment: "natural", revision: 1 });
    expect(current.records[0]!.firstJudgment).toBe("natural");
    expect(current.records[0]!.revision).toBe(2);
  });

  it("범위를 벗어난 missionIndex는 상태를 바꾸지 않는다", () => {
    const read = startToRead();
    expect(
      sessionReducer(read, { ...validAction, missionIndex: 6 }),
    ).toBe(read);
    expect(
      sessionReducer(read, { ...validAction, missionIndex: -1 }),
    ).toBe(read);
  });

  it("완료 이후에는 답을 바꿀 수 없다", () => {
    let state = createInitialSessionState();
    for (let missionIndex = 0; missionIndex < 6; missionIndex += 1) {
      state = sessionReducer(state, { type: "START_SESSION" });
      let revision = 0;
      state = sessionReducer(state, {
        type: "SET_FIRST_JUDGMENT",
        missionIndex,
        judgment: "needs-repair",
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
      state = sessionReducer(state, {
        type: "SET_TOPIC",
        missionIndex,
        sentenceId: "G1",
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
      state = sessionReducer(state, {
        type: "SET_ORDER",
        missionIndex,
        orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"],
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
      state = sessionReducer(state, {
        type: "SET_REMOVED",
        missionIndex,
        removedIds: ["GX"],
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
      state = sessionReducer(state, {
        type: "SET_CONNECTOR",
        missionIndex,
        connectorId: "garden-01.conn-first",
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
      state = sessionReducer(state, {
        type: "SET_EXPLAIN",
        missionIndex,
        relationLabel: "sequence",
        reasonText: "먼저, 그다음 단서가 있어요.",
        revision: revision++,
      });
      state = sessionReducer(state, { type: "ADVANCE" });
    }
    expect(state.step).toBe("REPORT");
    expect(state.phase).toBe("complete");

    const locked = sessionReducer(state, {
      type: "SET_TOPIC",
      missionIndex: 0,
      sentenceId: "G2",
      revision: 99,
    });
    expect(locked).toBe(state);
    expect(sessionReducer(state, { type: "ADVANCE" })).toBe(state);
    expect(sessionReducer(state, { type: "GO_BACK" })).toBe(state);
  });

  it("back은 직전 단계로 가되 응답을 보존한다", () => {
    const read = startToRead();
    const judged = sessionReducer(read, validAction);
    const topic = sessionReducer(judged, { type: "ADVANCE" });
    const chosen = sessionReducer(topic, {
      type: "SET_TOPIC",
      missionIndex: 0,
      sentenceId: "G1",
      revision: 1,
    });

    const backToRead = sessionReducer(chosen, { type: "GO_BACK" });
    expect(backToRead.step).toBe("READ");
    expect(backToRead.records[0]!.firstJudgment).toBe("needs-repair");

    const forwardAgain = sessionReducer(backToRead, { type: "ADVANCE" });
    expect(forwardAgain.step).toBe("TOPIC");
    expect(forwardAgain.records[0]!.topicSentenceId).toBe("G1");
  });

  it("첫 미션 READ에서 back하면 입구로 돌아간다", () => {
    const read = startToRead();
    const intro = sessionReducer(read, { type: "GO_BACK" });
    expect(intro.step).toBe("INTRO");
    expect(intro.missionIndex).toBe(0);
  });

  it("이전 미션의 마지막 단계로 back하면 응답이 남는다", () => {
    let state = startToRead();
    state = sessionReducer(state, validAction);
    state = sessionReducer(state, { type: "ADVANCE" });
    state = sessionReducer(state, {
      type: "SET_TOPIC",
      missionIndex: 0,
      sentenceId: "G1",
      revision: 1,
    });
    state = sessionReducer(state, { type: "ADVANCE" });

    const backToOrder = sessionReducer(state, { type: "GO_BACK" });
    expect(backToOrder.step).toBe("TOPIC");
    expect(backToOrder.missionIndex).toBe(0);

    const backFromSecondMissionRead = sessionReducer(
      sessionReducer(state, {
        type: "SET_ORDER",
        missionIndex: 0,
        orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"],
        revision: 2,
      }),
      { type: "ADVANCE" },
    );
    expect(backFromSecondMissionRead.step).toBe("RELEVANCE");
    const jumpedBack = sessionReducer(backFromSecondMissionRead, { type: "GO_BACK" });
    expect(jumpedBack.step).toBe("ORDER");
  });

  it("restartConfirmed는 초기 상태를 새 객체로 만든다", () => {
    const read = startToRead();
    const judged = sessionReducer(read, validAction);
    const restarted = sessionReducer(judged, { type: "RESTART_CONFIRMED" });
    expect(restarted).toEqual(createInitialSessionState());
    expect(restarted).not.toBe(judged);
    expect(restarted.records).not.toBe(judged.records);
  });

  it("알 수 없는 action은 상태를 바꾸지 않는다", () => {
    const read = startToRead();
    const unknown = { type: "무엇인가이상한것" } as unknown as SessionAction;
    expect(sessionReducer(read, unknown)).toBe(read);
  });

  it("상태와 기록을 불변으로 업데이트한다", () => {
    const read = startToRead();
    const snapshot = JSON.stringify(read);
    const judged = sessionReducer(read, validAction);
    expect(JSON.stringify(read)).toBe(snapshot);
    expect(judged.records).not.toBe(read.records);
    expect(read.records[0]!.firstJudgment).toBeUndefined();
  });
});
