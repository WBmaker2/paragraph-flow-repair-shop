import { describe, expect, it } from "vitest";
import { missions } from "../content/missions";
import type { ParagraphMission } from "./types";
import {
  evaluateConnector,
  evaluateOffTopic,
  evaluateOrder,
  evaluateTopic,
} from "./paragraphEvaluator";

const missionById = new Map(missions.map((m) => [m.id, m]));
const ids = (order: string): string[] => order.split("-");

function expectAccepted(mission: ParagraphMission, order: string) {
  const result = evaluateOrder(mission, Object.freeze(ids(order)));
  expect(result.accepted, `${mission.id}: ${order}`).toBe(true);
  expect(result.brokenPairs, `${mission.id}: ${order}`).toEqual([]);
}

describe("evaluateOrder", () => {
  it("정확 순서를 받아들인다(6개 미션)", () => {
    for (const mission of missions) {
      expectAccepted(mission, mission.acceptedOrderIds[0]!);
    }
  });

  it("허용된 대안 순서를 오답으로 표시하지 않는다(4개 복수 해법)", () => {
    for (const mission of missions) {
      for (const alt of mission.acceptedOrderIds.slice(1)) {
        expectAccepted(mission, alt);
      }
    }
  });

  it("off-topic 문장이 섞여 있어도 관계 판정에서 무시한다", () => {
    expectAccepted(missionById.get("paragraph-garden-01")!, "GX-G1-G2-G3-G4-G5");
    expectAccepted(missionById.get("paragraph-rain-02")!, "R1-R2-R3-R4-RX");
  });

  it("한 쌍만 뒤집힌 순서는 그 근거만 어겼다고 보고한다(4건)", () => {
    const cases: ReadonlyArray<{ mission: ParagraphMission; order: string; broken: string }> = [
      {
        mission: missionById.get("paragraph-garden-01")!,
        order: "G1-G2-G3-G5-G4-GX",
        broken: "garden-01.g4-before-g5",
      },
      {
        mission: missionById.get("paragraph-rain-02")!,
        order: "R1-R3-R2-R4-RX",
        broken: "rain-02.r2-before-r3",
      },
      {
        mission: missionById.get("paragraph-bottle-04")!,
        order: "B1-B2-B4-B3-B5",
        broken: "bottle-04.b3-before-b4",
      },
      {
        mission: missionById.get("paragraph-playground-06")!,
        order: "P1-P2-P4-P3",
        broken: "playground-06.p3-before-p4",
      },
    ];
    for (const { mission, order, broken } of cases) {
      const result = evaluateOrder(mission, Object.freeze(ids(order)));
      expect(result.accepted, `${mission.id}: ${order}`).toBe(false);
      expect(result.brokenPairs).toEqual([broken]);
      expect(result.satisfiedPairs.length).toBe(mission.precedencePairs.length - 1);
      expect(result.evidenceKeys).toContain(broken);
    }
  });

  it("문장이 빠지면 관계 쌍이 어긋난 것으로 보고한다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    const result = evaluateOrder(garden, Object.freeze(["G1", "G2", "G3", "G4"]));
    expect(result.accepted).toBe(false);
    expect(result.brokenPairs).toContain("garden-01.g3-before-g5");
    expect(result.brokenPairs).toContain("garden-01.g4-before-g5");
  });

  it("잘못된 입력에서도 예외 없이 미달 판정을 돌려준다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    expect(evaluateOrder(garden, Object.freeze([])).accepted).toBe(false);
    expect(evaluateOrder(garden, Object.freeze(["G1", "G1", "G2"])).accepted).toBe(false);
    expect(evaluateOrder(garden, Object.freeze(["ZZ", "G1", "G2", "G3", "G4", "G5"])).accepted).toBe(true);
    expect(evaluateOrder(garden, Object.freeze(["G5", "G4", "G3", "G2", "G1"])).accepted).toBe(false);
  });

  it("readonly 입력을 변이하지 않는다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    const frozen: readonly string[] = Object.freeze(["G1", "G3", "G2", "GX", "G5", "G4"]);
    evaluateOrder(garden, frozen);
    expect([...frozen]).toEqual(["G1", "G3", "G2", "GX", "G5", "G4"]);
  });
});

describe("evaluateTopic", () => {
  it("중심 문장을 받아들이고 보조 문장을 거절한다(6개 미션)", () => {
    for (const mission of missions) {
      const topicId = mission.topicSentenceIds[0]!;
      const support = mission.sentences.find(
        (s) => !mission.topicSentenceIds.includes(s.id) && !s.roles.includes("off-topic"),
      )!;
      expect(evaluateTopic(mission, topicId).accepted).toBe(true);
      expect(evaluateTopic(mission, support.id).accepted).toBe(false);
    }
  });

  it("어린이용 근거 키를 돌려준다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    expect(evaluateTopic(garden, "G1").evidenceKeys).toEqual(["topic.accepted"]);
    expect(evaluateTopic(garden, "G3").evidenceKeys).toEqual(["topic.rejected"]);
  });

  it("알 수 없는 문장 ID를 예외 없이 거절한다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    expect(evaluateTopic(garden, "ZZ").accepted).toBe(false);
  });
});

describe("evaluateOffTopic", () => {
  it("off-topic 문장만 골랐을 때 받아들인다", () => {
    expect(evaluateOffTopic(missionById.get("paragraph-garden-01")!, ["GX"])).toEqual({
      accepted: true,
      missingIds: [],
      wrongIds: [],
      evidenceKeys: [],
    });
  });

  it("벗어난 문장이 없는 미션은 그대로 두면 받아들인다", () => {
    expect(evaluateOffTopic(missionById.get("paragraph-library-03")!, [])).toEqual({
      accepted: true,
      missingIds: [],
      wrongIds: [],
      evidenceKeys: [],
    });
  });

  it("관련 없는 문장 오판 3건을 근거와 함께 보고한다", () => {
    const wrongPick = evaluateOffTopic(missionById.get("paragraph-garden-01")!, ["G2"]);
    expect(wrongPick.accepted).toBe(false);
    expect(wrongPick.wrongIds).toEqual(["G2"]);
    expect(wrongPick.missingIds).toEqual(["GX"]);
    expect(wrongPick.evidenceKeys).toEqual(["offtopic.missing", "offtopic.wrong"]);

    const wrongPickRain = evaluateOffTopic(missionById.get("paragraph-rain-02")!, ["R4"]);
    expect(wrongPickRain.accepted).toBe(false);
    expect(wrongPickRain.wrongIds).toEqual(["R4"]);
    expect(wrongPickRain.missingIds).toEqual(["RX"]);

    const mixed = evaluateOffTopic(missionById.get("paragraph-butterfly-05")!, ["F2", "FX"]);
    expect(mixed.accepted).toBe(false);
    expect(mixed.wrongIds).toEqual(["F2"]);
    expect(mixed.missingIds).toEqual([]);
    expect(mixed.evidenceKeys).toEqual(["offtopic.wrong"]);
  });

  it("알 수 없는 ID는 예외 없이 처리한다", () => {
    const garden = missionById.get("paragraph-garden-01")!;
    expect(evaluateOffTopic(garden, ["ZZ"]).accepted).toBe(false);
  });
});

describe("evaluateConnector", () => {
  it("동등한 연결어를 복수 정답으로 인정한다(4건)", () => {
    const equivalents: ReadonlyArray<{ mission: ParagraphMission; both: readonly [string, string] }> = [
      { mission: missionById.get("paragraph-rain-02")!, both: ["rain-02.conn-therefore", "rain-02.conn-result"] },
      { mission: missionById.get("paragraph-library-03")!, both: ["library-03.conn-contrast", "library-03.conn-but"] },
      { mission: missionById.get("paragraph-butterfly-05")!, both: ["butterfly-05.conn-and", "butterfly-05.conn-also"] },
      { mission: missionById.get("paragraph-playground-06")!, both: ["playground-06.conn-because", "playground-06.conn-reason"] },
    ];
    for (const { mission, both } of equivalents) {
      for (const id of both) {
        const result = evaluateConnector(mission, id);
        expect(result.accepted, `${mission.id}: ${id}`).toBe(true);
        expect(result.evidenceKeys).toEqual(["connector.accepted"]);
      }
    }
  });

  it("관계가 맞지 않는 연결어를 거절한다", () => {
    const rain = missionById.get("paragraph-rain-02")!;
    const result = evaluateConnector(rain, "rain-02.conn-first");
    expect(result.accepted).toBe(false);
    expect(result.evidenceKeys).toEqual(["connector.rejected"]);
  });

  it("알 수 없는 연결어 ID를 예외 없이 거절한다", () => {
    const rain = missionById.get("paragraph-rain-02")!;
    expect(evaluateConnector(rain, "없는선택지").accepted).toBe(false);
  });
});
