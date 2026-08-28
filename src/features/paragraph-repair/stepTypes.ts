import type { Dispatch } from "react";
import type { MissionRecord, SessionAction } from "../../app/sessionReducer";
import type { ParagraphMission } from "../../domain/types";

export interface StepProps {
  readonly mission: ParagraphMission;
  readonly record: MissionRecord;
  readonly dispatch: Dispatch<SessionAction>;
}

/** 판정 단계의 공통 결과 상태: 첫 미달 뒤 한 번의 수정 기회, 두 번째 미달은 판단 보류. */
export const ATTEMPTS_BEFORE_DEFERRAL = 2;
