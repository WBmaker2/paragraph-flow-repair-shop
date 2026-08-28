/** 문단 흐름 수리소 도메인 타입 계약 (계획 문서 §7.1). */

export type MissionId =
  | "paragraph-garden-01"
  | "paragraph-rain-02"
  | "paragraph-library-03"
  | "paragraph-bottle-04"
  | "paragraph-butterfly-05"
  | "paragraph-playground-06";

export type Relation =
  | "sequence"
  | "cause-effect"
  | "compare"
  | "problem-solution"
  | "description"
  | "claim-support";

export type SentenceRole = "topic" | "support" | "off-topic" | "closing";

export interface SentenceCard {
  readonly id: string;
  readonly text: string;
  readonly roles: readonly SentenceRole[];
}

export interface PrecedencePair {
  readonly beforeId: string;
  readonly afterId: string;
  readonly reasonKey: string;
}

export interface ConnectorOption {
  readonly id: string;
  readonly text: string;
  readonly relations: readonly Relation[];
}

export interface ParagraphMission {
  readonly id: MissionId;
  readonly relation: Relation;
  readonly sentences: readonly SentenceCard[];
  readonly topicSentenceIds: readonly string[];
  readonly precedencePairs: readonly PrecedencePair[];
  readonly acceptedOrderIds: readonly string[];
  readonly offTopicSentenceIds: readonly string[];
  readonly connectorOptions: readonly ConnectorOption[];
  readonly sourceNote: string;
  readonly reviewStatus: "pending" | "approved";
  readonly misconceptionGuard: string;
}

export interface ParagraphEvaluation {
  readonly accepted: boolean;
  readonly satisfiedPairs: readonly string[];
  readonly brokenPairs: readonly string[];
  readonly evidenceKeys: readonly string[];
}

export interface TopicEvaluation {
  readonly accepted: boolean;
  readonly evidenceKeys: readonly string[];
}

export interface OffTopicEvaluation {
  readonly accepted: boolean;
  readonly missingIds: readonly string[];
  readonly wrongIds: readonly string[];
  readonly evidenceKeys: readonly string[];
}

export interface ConnectorEvaluation {
  readonly accepted: boolean;
  readonly evidenceKeys: readonly string[];
}

export type SessionStep =
  | "INTRO"
  | "READ"
  | "TOPIC"
  | "ORDER"
  | "RELEVANCE"
  | "CONNECTOR"
  | "EXPLAIN"
  | "REPORT";

/** 학생이 READ 단계에서 남기는 최초 흐름 판단. */
export type FirstJudgment = "natural" | "needs-repair";
