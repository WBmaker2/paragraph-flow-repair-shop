import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { RefObject } from "react";
import ParagraphWorkbench from "./ParagraphWorkbench";
import { initialOrderIds, missions } from "../../content/missions";
import type { SessionState, SessionAction, MissionRecord } from "../../app/sessionReducer";
import type { SessionStep } from "../../domain/types";

const garden = missions[0]!;

function makeState(step: SessionStep, missionIndex: number, record: Partial<MissionRecord> = {}): SessionState {
  return {
    step,
    missionIndex,
    phase: "active",
    records: Array.from({ length: 6 }, (_, i) =>
      i === missionIndex ? { missionIndex: i, revision: 0, ...record } : { missionIndex: i, revision: 0 },
    ),
  };
}

function setup(step: SessionStep, missionIndex = 0, record: Partial<MissionRecord> = {}) {
  const dispatch = vi.fn() as Mock<(action: SessionAction) => void>;
  const headingRef: RefObject<HTMLHeadingElement> = { current: null };
  render(
    <ParagraphWorkbench
      state={makeState(step, missionIndex, record)}
      dispatch={dispatch}
      headingRef={headingRef}
    />,
  );
  return { dispatch };
}

const actionsOf = (dispatch: Mock) => dispatch.mock.calls.map(([a]) => a as SessionAction);
const lastAction = (dispatch: Mock) => actionsOf(dispatch).at(-1)!;
const gardenText = (id: string) => garden.sentences.find((s) => s.id === id)!.text;

async function moveUp(user: ReturnType<typeof userEvent.setup>, id: string, times: number) {
  for (let i = 0; i < times; i += 1) {
    await user.click(screen.getByRole("button", { name: `${gardenText(id)} 위로 이동` }));
  }
}

async function moveDown(user: ReturnType<typeof userEvent.setup>, id: string, times: number) {
  for (let i = 0; i < times; i += 1) {
    await user.click(screen.getByRole("button", { name: `${gardenText(id)} 아래로 이동` }));
  }
}

describe("전체 읽기 단계", () => {
  it("문장 띠를 처음 순서 그대로 보여 준다", () => {
    setup("READ", 0);
    const strip = screen.getByRole("list", { name: "처음 문장 띠" });
    const texts = within(strip)
      .getAllByRole("listitem")
      .map((li) => li.textContent ?? "");
    expect(texts.map((t) => t.replace(/^\d+/, ""))).toEqual(initialOrderIds["paragraph-garden-01"].map(gardenText));
  });

  it("최초 판단을 남기기 전에는 다음이 잠긴다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("READ", 0);
    const next = screen.getByRole("button", { name: "다음" });
    expect(next).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "고쳐야 할 것 같아요" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_FIRST_JUDGMENT", judgment: "needs-repair" });

    await user.click(next);
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });
});

describe("중심 문장 단계", () => {
  it("문장을 고르고 완료해야 판정을 보여 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("TOPIC", 0);
    await user.click(screen.getByRole("button", { name: gardenText("G1") }));
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_TOPIC", sentenceId: "G1" });

    await user.click(screen.getByRole("button", { name: "고르기 완료" }));
    expect(screen.getByText("문단의 중심 생각을 담은 문장을 골랐어요.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });

  it("오답은 정답을 공개하지 않고 근거와 한 번의 수정 기회를 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("TOPIC", 0);
    await user.click(screen.getByRole("button", { name: gardenText("G3") }));
    await user.click(screen.getByRole("button", { name: "고르기 완료" }));

    expect(screen.getByText("이 문장은 중심 생각을 직접 말하지 않아요. 문단 전체를 한 문장으로 소개한다면 무엇인지 다시 보세요.")).toBeInTheDocument();
    expect(screen.queryByText(/G1/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다음 단계로" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: gardenText("G1") }));
    await user.click(screen.getByRole("button", { name: "고르기 완료" }));
    expect(screen.getByText("문단의 중심 생각을 담은 문장을 골랐어요.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });
});

describe("순서 수리 단계", () => {
  it("위·아래 버튼으로 문장을 옮기고 유효한 순서를 통과시킨다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("ORDER", 0);

    await moveUp(user, "G2", 1);
    await moveUp(user, "G4", 2);
    await moveDown(user, "GX", 1);

    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));
    expect(lastAction(dispatch)).toMatchObject({
      type: "SET_ORDER",
      orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"],
    });
    expect(screen.getByText("문단이 자연스럽게 이어져요!")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });

  it("한 쌍이 뒤집힌 순서는 근거를 보여 주고 정답을 공개하지 않는다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("ORDER", 0);

    await moveUp(user, "G2", 1);
    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));

    const panel = screen.getByRole("status");
    expect(panel).toHaveTextContent("이름표를 꽂은 다음에 마지막으로 흙을 덮고 물을 줘요.");
    expect(panel).not.toHaveTextContent("G1-G2-G3-G4-G5");
    expect(screen.queryByRole("button", { name: "다음 단계로" })).not.toBeInTheDocument();

    const setOrder = actionsOf(dispatch).find((a) => a.type === "SET_ORDER");
    expect(setOrder).toBeDefined();
  });

  it("두 번 연속 미달이면 판단 보류로 다음 단계를 열어 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("ORDER", 0);

    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));
    expect(screen.queryByRole("button", { name: "다음 단계로" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));
    expect(screen.getByText("함께 다시 볼 근거예요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });

  it("이미 제출한 순서가 있으면 그 순서로 작업대를 연다", () => {
    setup("ORDER", 0, { orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"] });
    const strip = screen.getByRole("list", { name: "문장 작업대" });
    expect(within(strip).getAllByRole("listitem")[0]).toHaveTextContent(gardenText("G1"));
  });
});

describe("관련성 점검 단계", () => {
  it("문장을 옮기기 전에는 완료 버튼이 잠긴다", () => {
    setup("RELEVANCE", 0);
    expect(screen.getByRole("button", { name: "관련성 점검 완료" })).toBeDisabled();
  });

  it("벗어난 문장을 보관함으로 옮기면 통과한다(삭제가 아니다)", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("RELEVANCE", 0);

    await user.click(screen.getByRole("button", { name: `${gardenText("GX")} 보관함으로 옮기기` }));
    const box = screen.getByRole("group", { name: "관련 없는 문장 보관함" });
    expect(box).toHaveTextContent(gardenText("GX"));
    expect(screen.getByText(gardenText("GX"))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "관련성 점검 완료" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_REMOVED", removedIds: ["GX"] });
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });

  it("문단에 필요한 문장을 옮기면 근거와 함께 되돌릴 기회를 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("RELEVANCE", 0);

    await user.click(screen.getByRole("button", { name: `${gardenText("G2")} 보관함으로 옮기기` }));
    await user.click(screen.getByRole("button", { name: "관련성 점검 완료" }));

    const panel = screen.getByRole("status");
    expect(panel).toHaveTextContent("이 문장은 문단의 중심 생각과 이어져 있어요.");
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_REMOVED", removedIds: ["G2"] });

    await user.click(screen.getByRole("button", { name: `${gardenText("G2")} 문단으로 돌리기` }));
    await user.click(screen.getByRole("button", { name: `${gardenText("GX")} 보관함으로 옮기기` }));
    await user.click(screen.getByRole("button", { name: "관련성 점검 완료" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_REMOVED", removedIds: ["GX"] });
  });
});

describe("이어 주는 말 단계", () => {
  const rainRecord: Partial<MissionRecord> = {
    orderIds: ["R1", "R2", "R3", "R4", "RX"],
  };

  it("앞뒤 문장을 함께 보여 주고, 고르기 전에는 완성 문단이 열리지 않는다", () => {
    setup("CONNECTOR", 1, rainRecord);
    expect(screen.getByText("비가 온 뒤 운동장 모습이 달라졌습니다.")).toBeInTheDocument();
    expect(screen.getByText("밤새 비가 많이 왔습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "완성 문단" })).not.toBeInTheDocument();
  });

  it("관계가 맞는 표현은 복수로 인정하고 완성 문단을 보여 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("CONNECTOR", 1, rainRecord);

    await user.click(screen.getByRole("button", { name: "그 결과" }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));
    expect(screen.getByText("앞뒤 문장이 이어지는 관계에 맞는 표현을 골랐어요.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "완성 문단" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다음 단계로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "ADVANCE" });
  });

  it("관계가 맞지 않으면 두 문장을 다시 보여 준다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("CONNECTOR", 1, rainRecord);

    await user.click(screen.getByRole("button", { name: "먼저" }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));

    const panel = screen.getByRole("status");
    expect(panel).toHaveTextContent("이 표현은 앞뒤 문장의 관계와 어울리지 않아요.");
    expect(screen.getByText("비가 온 뒤 운동장 모습이 달라졌습니다.")).toBeInTheDocument();
    expect(screen.getByText("밤새 비가 많이 왔습니다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "그래서" }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));
    expect(screen.getByText("앞뒤 문장이 이어지는 관계에 맞는 표현을 골랐어요.")).toBeInTheDocument();
    expect(lastAction(dispatch)).toMatchObject({ type: "SET_CONNECTOR", connectorId: "rain-02.conn-therefore" });
  });
});

describe("수리 이유 단계", () => {
  it("관계 근거를 고르고 자유 설명을 남긴 뒤 완료한다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("EXPLAIN", 0, { orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"] });

    await user.type(screen.getByRole("textbox", { name: /수리 이유/ }), "먼저, 그다음 단서가 있어요.");
    await user.click(screen.getByRole("button", { name: "시간 순서" }));
    const explain = actionsOf(dispatch).find((a) => a.type === "SET_EXPLAIN");
    expect(explain).toMatchObject({ relationLabel: "sequence" });

    await user.click(screen.getByRole("button", { name: "수리 완료 확인" }));
    const last = lastAction(dispatch);
    expect(["ADVANCE"]).toContain(last.type);
  });
});

describe("공통 동작", () => {
  it("뒤로 가기는 GO_BACK을 보낸다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup("TOPIC", 0);
    await user.click(screen.getByRole("button", { name: "뒤로" }));
    expect(lastAction(dispatch)).toMatchObject({ type: "GO_BACK" });
  });
});
