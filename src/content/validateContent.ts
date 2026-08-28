import type { MissionId, ParagraphMission } from "../domain/types";

const EXPECTED_MISSION_IDS: readonly MissionId[] = [
  "paragraph-garden-01",
  "paragraph-rain-02",
  "paragraph-library-03",
  "paragraph-bottle-04",
  "paragraph-butterfly-05",
  "paragraph-playground-06",
];

const VALID_RELATIONS = new Set([
  "sequence",
  "cause-effect",
  "compare",
  "problem-solution",
  "description",
  "claim-support",
]);

function orderSatisfiesPairs(
  mission: ParagraphMission,
  orderIds: readonly string[],
): boolean {
  const positions = new Map<string, number>();
  orderIds.forEach((id, index) => positions.set(id, index));
  return mission.precedencePairs.every((pair) => {
    const before = positions.get(pair.beforeId);
    const after = positions.get(pair.afterId);
    return before !== undefined && after !== undefined && before < after;
  });
}

/**
 * 고정 콘텐츠의 무결성을 검사한다(계획 문서 §7.2).
 * 문제가 없으면 빈 배열, 있으면 "코드: 설명" 문자열 배열을 돌려준다.
 */
export function validateContent(
  missions: readonly ParagraphMission[],
  feedback: Readonly<Record<string, string>>,
): string[] {
  const problems: string[] = [];

  if (missions.length !== EXPECTED_MISSION_IDS.length) {
    problems.push(`count: 미션은 정확히 6개여야 합니다 (현재 ${missions.length}개)`);
  }

  const seenMissionIds = new Set<string>();
  for (const mission of missions) {
    if (seenMissionIds.has(mission.id)) {
      problems.push(`count: 미션 ID 중복 ${mission.id}`);
    }
    seenMissionIds.add(mission.id);
  }
  for (const expectedId of EXPECTED_MISSION_IDS) {
    if (!seenMissionIds.has(expectedId)) {
      problems.push(`count: 필수 미션 누락 ${expectedId}`);
    }
  }

  for (const mission of missions) {
    const sentenceIds = mission.sentences.map((s) => s.id);
    const uniqueIds = new Set(sentenceIds);

    if (sentenceIds.length < 4 || sentenceIds.length > 6) {
      problems.push(`sentence-count: ${mission.id} 문장 수는 4~6개여야 합니다 (현재 ${sentenceIds.length}개)`);
    }
    if (uniqueIds.size !== sentenceIds.length) {
      problems.push(`id-duplicate: ${mission.id} 문장 ID 중복`);
    }

    const optionIds = mission.connectorOptions.map((o) => o.id);
    if (new Set(optionIds).size !== optionIds.length) {
      problems.push(`id-duplicate: ${mission.id} 선택지 ID 중복`);
    }
    const reasonKeys = mission.precedencePairs.map((p) => p.reasonKey);
    if (new Set(reasonKeys).size !== reasonKeys.length) {
      problems.push(`id-duplicate: ${mission.id} 판정 근거 키 중복`);
    }

    for (const id of [
      ...mission.topicSentenceIds,
      ...mission.offTopicSentenceIds,
      ...mission.precedencePairs.flatMap((p) => [p.beforeId, p.afterId]),
      ...mission.acceptedOrderIds.flatMap((o) => o.split("-")),
    ]) {
      if (!uniqueIds.has(id)) {
        problems.push(`reference-missing: ${mission.id} 알 수 없는 문장 참조 ${id}`);
      }
    }

    if (mission.precedencePairs.length < 2) {
      problems.push(`pair-count: ${mission.id} precedencePairs는 2개 이상이어야 합니다`);
    }

    if (mission.topicSentenceIds.length < 1) {
      problems.push(`topic-missing: ${mission.id} 중심 문장이 없습니다`);
    }

    if (mission.acceptedOrderIds.length < 1) {
      problems.push(`accepted-order: ${mission.id} 승인 순서가 없습니다`);
    }
    const coreIds = sentenceIds
      .filter((id) => !mission.offTopicSentenceIds.includes(id))
      .sort();
    for (const order of mission.acceptedOrderIds) {
      const parts = order.split("-");
      if (parts.length !== coreIds.length || [...parts].sort().join("-") !== coreIds.join("-")) {
        problems.push(`accepted-order: ${mission.id} 승인 순서가 문단 문장과 일치하지 않습니다: ${order}`);
      } else if (!orderSatisfiesPairs(mission, parts)) {
        problems.push(`accepted-order-consistency: ${mission.id} 승인 순서가 관계 쌍을 어깁니다: ${order}`);
      }
    }

    for (const id of mission.offTopicSentenceIds) {
      const sentence = mission.sentences.find((s) => s.id === id);
      if (!sentence || !sentence.roles.includes("off-topic")) {
        problems.push(`off-topic-role: ${mission.id} ${id}는 off-topic 역할이 아닙니다`);
      }
    }
    for (const id of mission.topicSentenceIds) {
      const sentence = mission.sentences.find((s) => s.id === id);
      if (!sentence || !sentence.roles.includes("topic")) {
        problems.push(`off-topic-role: ${mission.id} ${id}는 topic 역할이 아닙니다`);
      }
    }

    if (mission.connectorOptions.length < 1) {
      problems.push(`connector-options: ${mission.id} 이어 주는 말 선택지가 없습니다`);
    }
    for (const option of mission.connectorOptions) {
      const relations = option.relations.filter((r) => VALID_RELATIONS.has(r));
      if (relations.length !== option.relations.length || relations.length < 1) {
        problems.push(`connector-options: ${mission.id} ${option.id}의 관계가 올바르지 않습니다`);
      }
    }

    if (!mission.sourceNote || mission.sourceNote.trim().length < 10) {
      problems.push(`source-note: ${mission.id} sourceNote가 필요합니다`);
    }
    if (mission.reviewStatus !== "pending" && mission.reviewStatus !== "approved") {
      problems.push(`review-status: ${mission.id} reviewStatus는 pending 또는 approved여야 합니다`);
    }
    if (!mission.misconceptionGuard || mission.misconceptionGuard.trim().length < 10) {
      problems.push(`misconception-guard: ${mission.id} misconceptionGuard가 필요합니다`);
    }

    for (const key of reasonKeys) {
      const text = feedback[key];
      if (!text || text.trim().length < 6 || /TODO|placeholder/i.test(text)) {
        problems.push(`feedback: ${mission.id} 근거 문구 누락 또는 불충분: ${key}`);
      }
    }
  }

  return problems;
}

/** 잘못된 콘텐츠는 개발·빌드 시 예외로 중단한다(계획 문서 §7.2). */
export function assertContentValid(
  missions: readonly ParagraphMission[],
  feedback: Readonly<Record<string, string>>,
): void {
  const problems = validateContent(missions, feedback);
  if (problems.length > 0) {
    throw new Error(`콘텐츠 검수 실패:\n${problems.join("\n")}`);
  }
}
