import type { Dispatch, RefObject } from "react";
import type { SessionAction, SessionState } from "../../app/sessionReducer";
import { missionTitles, missions } from "../../content/missions";
import type { SessionStep } from "../../domain/types";
import ProgressSteps from "../../components/ProgressSteps";
import ReadStep from "./steps/ReadStep";
import TopicStep from "./steps/TopicStep";
import OrderStep from "./steps/OrderStep";
import RelevanceStep from "./steps/RelevanceStep";
import ConnectorStep from "./steps/ConnectorStep";
import ExplainStep from "./steps/ExplainStep";

const STEP_TITLES: Partial<Record<SessionStep, string>> = {
  READ: "전체 읽기",
  TOPIC: "중심 문장 찾기",
  ORDER: "문장 순서 수리",
  RELEVANCE: "관련 없는 문장 분리",
  CONNECTOR: "이어 주는 말 선택",
  EXPLAIN: "수리 이유",
};

interface ParagraphWorkbenchProps {
  readonly state: SessionState;
  readonly dispatch: Dispatch<SessionAction>;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

export default function ParagraphWorkbench({ state, dispatch, headingRef }: ParagraphWorkbenchProps) {
  const mission = missions[state.missionIndex]!;
  const record = state.records[state.missionIndex]!;
  const stepProps = { mission, record, dispatch };

  return (
    <section aria-labelledby="workbench-title">
      <h1 id="workbench-title" tabIndex={-1} ref={headingRef} className="screen-title">
        {state.missionIndex + 1}번 미션 · {missionTitles[mission.id]}
      </h1>
      <h2 className="step-title">{STEP_TITLES[state.step] ?? state.step}</h2>
      <ProgressSteps current={state.step} />

      {state.step === "READ" && <ReadStep {...stepProps} />}
      {state.step === "TOPIC" && <TopicStep {...stepProps} />}
      {state.step === "ORDER" && <OrderStep {...stepProps} />}
      {state.step === "RELEVANCE" && <RelevanceStep {...stepProps} />}
      {state.step === "CONNECTOR" && <ConnectorStep {...stepProps} />}
      {state.step === "EXPLAIN" && <ExplainStep {...stepProps} />}

      <div className="workbench-actions workbench-actions--secondary">
        <button
          type="button"
          className="action-button action-button--ghost"
          onClick={() => dispatch({ type: "GO_BACK" })}
        >
          뒤로
        </button>
      </div>
    </section>
  );
}
