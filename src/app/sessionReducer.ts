import type { FirstJudgment, Relation, SessionStep } from "../domain/types";

export const MISSION_COUNT = 6;

export interface MissionRecord {
  readonly missionIndex: number;
  readonly revision: number;
  readonly firstJudgment?: FirstJudgment;
  readonly topicSentenceId?: string;
  readonly orderIds?: readonly string[];
  readonly removedSentenceIds?: readonly string[];
  readonly connectorId?: string;
  readonly relationLabel?: Relation;
  readonly reasonText?: string;
}

export interface SessionState {
  readonly step: SessionStep;
  readonly missionIndex: number;
  readonly records: readonly MissionRecord[];
  readonly phase: "active" | "complete";
}

export type SessionAction =
  | { type: "START_SESSION" }
  | { type: "SET_FIRST_JUDGMENT"; missionIndex: number; judgment: FirstJudgment; revision: number }
  | { type: "SET_TOPIC"; missionIndex: number; sentenceId: string; revision: number }
  | { type: "SET_ORDER"; missionIndex: number; orderIds: readonly string[]; revision: number }
  | { type: "SET_REMOVED"; missionIndex: number; removedIds: readonly string[]; revision: number }
  | { type: "SET_CONNECTOR"; missionIndex: number; connectorId: string; revision: number }
  | {
      type: "SET_EXPLAIN";
      missionIndex: number;
      relationLabel: Relation;
      reasonText: string;
      revision: number;
    }
  | { type: "ADVANCE" }
  | { type: "GO_BACK" }
  | { type: "RESTART_CONFIRMED" };

export function createInitialSessionState(): SessionState {
  return {
    step: "INTRO",
    missionIndex: 0,
    phase: "active",
    records: Array.from({ length: MISSION_COUNT }, (_, missionIndex) => ({
      missionIndex,
      revision: 0,
    })),
  };
}

const PREVIOUS_STEP: Partial<Record<SessionStep, SessionStep>> = {
  TOPIC: "READ",
  ORDER: "TOPIC",
  RELEVANCE: "ORDER",
  CONNECTOR: "RELEVANCE",
  EXPLAIN: "CONNECTOR",
};

function isValidMissionIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < MISSION_COUNT;
}

function withRecord(
  state: SessionState,
  missionIndex: number,
  revision: number,
  patch: Partial<Omit<MissionRecord, "missionIndex" | "revision">>,
): SessionState {
  if (state.phase !== "active" || !isValidMissionIndex(missionIndex)) return state;
  const record = state.records[missionIndex]!;
  if (record.revision !== revision) return state;
  const records = state.records.map((r, i) =>
    i === missionIndex ? { ...r, ...patch, revision: revision + 1 } : r,
  );
  return { ...state, records };
}

/** ADVANCE는 현재 단계의 필수 응답이 있을 때만 전이를 허용한다(계획 문서 §9). */
function advance(state: SessionState): SessionState {
  if (state.phase !== "active") return state;
  const { step, missionIndex } = state;

  if (step === "INTRO") {
    return { ...state, step: "READ", missionIndex: 0 };
  }
  if (step === "REPORT") return state;

  const record = state.records[missionIndex]!;
  const satisfied =
    (step === "READ" && record.firstJudgment !== undefined) ||
    (step === "TOPIC" && record.topicSentenceId !== undefined) ||
    (step === "ORDER" && (record.orderIds?.length ?? 0) > 0) ||
    (step === "RELEVANCE" && record.removedSentenceIds !== undefined) ||
    (step === "CONNECTOR" && record.connectorId !== undefined) ||
    (step === "EXPLAIN" && record.relationLabel !== undefined);
  if (!satisfied) return state;

  if (step === "EXPLAIN") {
    if (missionIndex + 1 < MISSION_COUNT) {
      return { ...state, step: "READ", missionIndex: missionIndex + 1 };
    }
    return { ...state, step: "REPORT", phase: "complete" };
  }

  const order: SessionStep[] = ["READ", "TOPIC", "ORDER", "RELEVANCE", "CONNECTOR", "EXPLAIN"];
  const next = order[order.indexOf(step) + 1]!;
  return { ...state, step: next };
}

function goBack(state: SessionState): SessionState {
  if (state.phase !== "active") return state;
  const { step, missionIndex } = state;

  if (step === "READ") {
    if (missionIndex === 0) return { ...state, step: "INTRO" };
    return { ...state, step: "EXPLAIN", missionIndex: missionIndex - 1 };
  }
  const previous = PREVIOUS_STEP[step];
  if (!previous) return state;
  return { ...state, step: previous };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "START_SESSION":
      return state.step === "INTRO" ? { ...state, step: "READ", missionIndex: 0 } : state;
    case "SET_FIRST_JUDGMENT":
      return withRecord(state, action.missionIndex, action.revision, {
        firstJudgment: action.judgment,
      });
    case "SET_TOPIC":
      return withRecord(state, action.missionIndex, action.revision, {
        topicSentenceId: action.sentenceId,
      });
    case "SET_ORDER":
      return withRecord(state, action.missionIndex, action.revision, {
        orderIds: [...action.orderIds],
      });
    case "SET_REMOVED":
      return withRecord(state, action.missionIndex, action.revision, {
        removedSentenceIds: [...action.removedIds],
      });
    case "SET_CONNECTOR":
      return withRecord(state, action.missionIndex, action.revision, {
        connectorId: action.connectorId,
      });
    case "SET_EXPLAIN":
      return withRecord(state, action.missionIndex, action.revision, {
        relationLabel: action.relationLabel,
        reasonText: action.reasonText,
      });
    case "ADVANCE":
      return advance(state);
    case "GO_BACK":
      return goBack(state);
    case "RESTART_CONFIRMED":
      return createInitialSessionState();
    default:
      return state;
  }
}
