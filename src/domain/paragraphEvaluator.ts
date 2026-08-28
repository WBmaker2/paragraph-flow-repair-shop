import type {
  ConnectorEvaluation,
  OffTopicEvaluation,
  ParagraphEvaluation,
  ParagraphMission,
  TopicEvaluation,
} from "./types";

/**
 * 문단 판정의 단일 경계(계획 문서 §7.2). 모든 함수는 순수하며 readonly 입력을
 * 변이하지 않고, 잘못된 입력에도 예외 없이 미달 판정을 돌려준다. 컴포넌트는
 * 정답 배열을 직접 조회하지 않고 이 결과만 렌더링한다.
 */

function coreIdsOf(mission: ParagraphMission): string[] {
  const offTopic = new Set(mission.offTopicSentenceIds);
  return mission.sentences.map((s) => s.id).filter((id) => !offTopic.has(id));
}

function coreOrder(mission: ParagraphMission, orderIds: readonly string[]): string[] {
  const known = new Set(mission.sentences.map((s) => s.id));
  const offTopic = new Set(mission.offTopicSentenceIds);
  const seen = new Set<string>();
  const core: string[] = [];
  for (const id of orderIds) {
    if (!known.has(id) || offTopic.has(id) || seen.has(id)) continue;
    seen.add(id);
    core.push(id);
  }
  return core;
}

export function evaluateOrder(
  mission: ParagraphMission,
  orderIds: readonly string[],
): ParagraphEvaluation {
  const core = coreOrder(mission, orderIds);
  const position = new Map(core.map((id, index) => [id, index]));

  const satisfiedPairs: string[] = [];
  const brokenPairs: string[] = [];
  for (const pair of mission.precedencePairs) {
    const before = position.get(pair.beforeId);
    const after = position.get(pair.afterId);
    if (before !== undefined && after !== undefined && before < after) {
      satisfiedPairs.push(pair.reasonKey);
    } else {
      brokenPairs.push(pair.reasonKey);
    }
  }

  const coreKey = core.join("-");
  const matchesAccepted = mission.acceptedOrderIds.includes(coreKey);
  const coreComplete = core.length === coreIdsOf(mission).length;
  const accepted = (matchesAccepted || (brokenPairs.length === 0 && coreComplete)) && coreComplete;

  return {
    accepted,
    satisfiedPairs,
    brokenPairs,
    evidenceKeys: [...satisfiedPairs, ...brokenPairs],
  };
}

export function evaluateTopic(
  mission: ParagraphMission,
  sentenceId: string,
): TopicEvaluation {
  const accepted = mission.topicSentenceIds.includes(sentenceId);
  return {
    accepted,
    evidenceKeys: [accepted ? "topic.accepted" : "topic.rejected"],
  };
}

export function evaluateOffTopic(
  mission: ParagraphMission,
  selectedIds: readonly string[],
): OffTopicEvaluation {
  const offTopic = new Set(mission.offTopicSentenceIds);
  const known = new Set(mission.sentences.map((s) => s.id));

  const missingIds = mission.offTopicSentenceIds.filter((id) => !selectedIds.includes(id));
  const wrongIds = selectedIds.filter((id) => known.has(id) && !offTopic.has(id));

  const evidenceKeys: string[] = [];
  if (missingIds.length > 0) evidenceKeys.push("offtopic.missing");
  if (wrongIds.length > 0) evidenceKeys.push("offtopic.wrong");

  return {
    accepted: missingIds.length === 0 && wrongIds.length === 0,
    missingIds,
    wrongIds,
    evidenceKeys,
  };
}

export function evaluateConnector(
  mission: ParagraphMission,
  connectorId: string,
): ConnectorEvaluation {
  const option = mission.connectorOptions.find((o) => o.id === connectorId);
  const accepted = option !== undefined && option.relations.includes(mission.relation);
  return {
    accepted,
    evidenceKeys: [accepted ? "connector.accepted" : "connector.rejected"],
  };
}
