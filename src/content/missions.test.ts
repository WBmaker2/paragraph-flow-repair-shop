import { describe, expect, it } from "vitest";
import { initialOrderIds, missionTitles, missions, pairFeedback } from "./missions";
import { validateContent } from "./validateContent";
import type { MissionId, Relation } from "../domain/types";

const EXPECTED_MISSION_IDS: readonly MissionId[] = [
  "paragraph-garden-01",
  "paragraph-rain-02",
  "paragraph-library-03",
  "paragraph-bottle-04",
  "paragraph-butterfly-05",
  "paragraph-playground-06",
];

const MULTI_SOLUTION_MISSION_IDS = new Set<MissionId>([
  "paragraph-garden-01",
  "paragraph-library-03",
  "paragraph-butterfly-05",
  "paragraph-playground-06",
]);

const EXPECTED_RELATION: Record<MissionId, Relation> = {
  "paragraph-garden-01": "sequence",
  "paragraph-rain-02": "cause-effect",
  "paragraph-library-03": "compare",
  "paragraph-bottle-04": "problem-solution",
  "paragraph-butterfly-05": "description",
  "paragraph-playground-06": "claim-support",
};

const EXPECTED_TOPIC_IDS: Record<MissionId, readonly string[]> = {
  "paragraph-garden-01": ["G1"],
  "paragraph-rain-02": ["R1"],
  "paragraph-library-03": ["L1"],
  "paragraph-bottle-04": ["B1"],
  "paragraph-butterfly-05": ["F1"],
  "paragraph-playground-06": ["P1"],
};

const EXPECTED_ACCEPTED_ORDERS: Record<MissionId, readonly string[]> = {
  "paragraph-garden-01": ["G1-G2-G3-G4-G5", "G1-G2-G4-G3-G5"],
  "paragraph-rain-02": ["R1-R2-R3-R4"],
  "paragraph-library-03": ["L1-L2-L3-L4-L5", "L1-L4-L5-L2-L3"],
  "paragraph-bottle-04": ["B1-B2-B3-B4-B5"],
  "paragraph-butterfly-05": ["F1-F2-F3-F4", "F1-F3-F2-F4"],
  "paragraph-playground-06": ["P1-P2-P3-P4", "P1-P3-P2-P4"],
};

/** 계획 문서 §4.1 고정 문장 fixture — 원문과 한 글자도 다르면 안 된다. */
const EXPECTED_TEXTS: Record<MissionId, readonly string[]> = {
  "paragraph-garden-01": [
    "우리 반은 화단에 씨앗을 심었습니다.",
    "먼저 흙을 고르게 다듬었습니다.",
    "작은 구멍마다 씨앗을 넣었습니다.",
    "씨앗 사이에 이름표도 꽂았습니다.",
    "마지막으로 흙을 덮고 물을 주었습니다.",
    "오늘 급식에는 국수가 나왔습니다.",
  ],
  "paragraph-rain-02": [
    "비가 온 뒤 운동장 모습이 달라졌습니다.",
    "밤새 비가 많이 왔습니다.",
    "운동장 바닥이 젖었습니다.",
    "그래서 체육 수업은 체육관에서 했습니다.",
    "새 우산은 노란색이었습니다.",
  ],
  "paragraph-library-03": [
    "도서관에는 책을 읽는 두 공간이 있습니다.",
    "창가 공간은 햇빛이 밝게 들어옵니다.",
    "안쪽 공간은 조명이 부드럽습니다.",
    "창가 쪽은 대화 소리가 조금 들립니다.",
    "안쪽 공간은 더 조용합니다.",
  ],
  "paragraph-bottle-04": [
    "점심시간 뒤 물병이 보이지 않았습니다.",
    "책상 아래를 살펴보았지만 없었습니다.",
    "마지막으로 간 미술실을 떠올렸습니다.",
    "미술실 선반에서 물병을 찾았습니다.",
    "앞으로 물병에 이름표를 붙이기로 했습니다.",
  ],
  "paragraph-butterfly-05": [
    "관찰한 나비의 날개에는 두 가지 특징이 있었습니다.",
    "날개 가장자리는 검은색이었습니다.",
    "가운데에는 둥근 무늬가 있었습니다.",
    "두 특징을 그림에 표시했습니다.",
    "점심에는 과일을 먹었습니다.",
  ],
  "paragraph-playground-06": [
    "빈 공간에 작은 그늘 쉼터를 만들면 좋겠습니다.",
    "햇볕이 강한 날에도 쉴 수 있습니다.",
    "잠시 쉬고 다시 안전하게 놀이할 수 있습니다.",
    "그래서 그늘 쉼터가 우리에게 도움이 됩니다.",
  ],
};

const byId = new Map(missions.map((m) => [m.id, m]));

describe("고정 미션 데이터(missions.ts)", () => {
  it("정확히 6개 미션을 계획된 ID와 순서로 제공한다", () => {
    expect(missions.map((m) => m.id)).toEqual([...EXPECTED_MISSION_IDS]);
  });

  it("모든 문장 텍스트가 계획 문서의 고정 fixture와 일치한다", () => {
    for (const mission of missions) {
      const texts = mission.sentences.map((s) => s.text);
      expect(texts).toHaveLength(EXPECTED_TEXTS[mission.id].length);
      expect([...texts].sort()).toEqual([...EXPECTED_TEXTS[mission.id]].sort());
    }
  });

  it("모든 미션의 검수 상태와 검수 메타데이터가 채워져 있다", () => {
    for (const mission of missions) {
      expect(mission.reviewStatus).toBe("pending");
      expect(mission.sourceNote.length).toBeGreaterThanOrEqual(10);
      expect(mission.misconceptionGuard.length).toBeGreaterThanOrEqual(10);
    }
  });

  it("각 미션은 4~6개 문장과 고유한 문장 ID를 가진다", () => {
    for (const mission of missions) {
      expect(mission.sentences.length).toBeGreaterThanOrEqual(4);
      expect(mission.sentences.length).toBeLessThanOrEqual(6);
      const ids = mission.sentences.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("관계, 중심 문장, 승인 순서가 계획 문서와 일치한다", () => {
    for (const mission of missions) {
      expect(mission.relation).toBe(EXPECTED_RELATION[mission.id]);
      expect([...mission.topicSentenceIds]).toEqual([...EXPECTED_TOPIC_IDS[mission.id]]);
      expect([...mission.acceptedOrderIds]).toEqual([...EXPECTED_ACCEPTED_ORDERS[mission.id]]);
    }
  });

  it("승인 순서는 문단 문장(off-topic 제외) 전체를 정확히 한 번씩 포함한다", () => {
    for (const mission of missions) {
      const coreIds = mission.sentences
        .map((s) => s.id)
        .filter((id) => !mission.offTopicSentenceIds.includes(id))
        .sort();
      for (const order of mission.acceptedOrderIds) {
        expect(order.split("-").sort()).toEqual(coreIds);
      }
    }
  });

  it("모든 precedencePairs가 모든 승인 순서에서 성립한다", () => {
    for (const mission of missions) {
      for (const order of mission.acceptedOrderIds) {
        const positions = new Map(order.split("-").map((id, index) => [id, index]));
        for (const pair of mission.precedencePairs) {
          const before = positions.get(pair.beforeId);
          const after = positions.get(pair.afterId);
          expect(before, `${mission.id} ${order} ${pair.reasonKey}`).toBeDefined();
          expect(after, `${mission.id} ${order} ${pair.reasonKey}`).toBeDefined();
          expect(before!).toBeLessThan(after!);
        }
      }
    }
  });

  it("복수 해법 미션은 승인 순서 2개 이상, 단일 해법 미션도 1개 이상이다", () => {
    for (const mission of missions) {
      if (MULTI_SOLUTION_MISSION_IDS.has(mission.id)) {
        expect(mission.acceptedOrderIds.length).toBeGreaterThanOrEqual(2);
      } else {
        expect(mission.acceptedOrderIds.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("중심 문장은 topic 역할을, 관련 없는 문장은 off-topic 역할을 가진다", () => {
    for (const mission of missions) {
      const roleById = new Map(mission.sentences.map((s) => [s.id, s.roles]));
      for (const id of mission.topicSentenceIds) {
        expect(roleById.get(id)).toContain("topic");
      }
      for (const id of mission.offTopicSentenceIds) {
        expect(roleById.get(id)).toContain("off-topic");
        expect(mission.topicSentenceIds).not.toContain(id);
      }
    }
  });

  it("이어 주는 말 선택지는 3개 이상이고, 검수된 관계 정답을 2개 이상 포함한다", () => {
    for (const mission of missions) {
      expect(mission.connectorOptions.length).toBeGreaterThanOrEqual(3);
      const optionIds = mission.connectorOptions.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      for (const option of mission.connectorOptions) {
        expect(option.text.length).toBeGreaterThanOrEqual(2);
        expect(option.relations.length).toBeGreaterThanOrEqual(1);
      }
      const acceptedConnectors = mission.connectorOptions.filter((o) =>
        o.relations.includes(mission.relation),
      );
      expect(acceptedConnectors.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("모든 근거 문구가 어린이용으로 준비되어 있다", () => {
    const reasonKeys = missions.flatMap((m) => m.precedencePairs.map((p) => p.reasonKey));
    for (const key of reasonKeys) {
      const text = pairFeedback[key];
      expect(text, `근거 문구 누락: ${key}`).toBeDefined();
      expect(text!.length).toBeGreaterThanOrEqual(6);
    }
    for (const key of ["topic.accepted", "topic.rejected", "offtopic.missing", "offtopic.wrong", "connector.accepted", "connector.rejected"]) {
      expect(pairFeedback[key], `공용 피드백 누락: ${key}`).toBeDefined();
    }
  });

  it("처음 보여 주는 문장 띠는 미션 문장 전체를 정확히 한 번씩 담는다", () => {
    for (const mission of missions) {
      const initial = initialOrderIds[mission.id];
      const sentenceIds = mission.sentences.map((s) => s.id);
      expect([...initial].sort()).toEqual([...sentenceIds].sort());
    }
  });

  it("미션 제목이 모두 준비되어 있다", () => {
    for (const id of EXPECTED_MISSION_IDS) {
      expect(missionTitles[id].length).toBeGreaterThanOrEqual(4);
    }
  });

  it("검수기가 실제 콘텐츠를 통과시킨다", () => {
    expect(validateContent(missions, pairFeedback)).toEqual([]);
  });

  it("미션 fixture는 모두 존재한다", () => {
    expect(byId.size).toBe(6);
  });
});
