import type { Dispatch, RefObject } from "react";
import type { SessionAction, SessionState } from "../../app/sessionReducer";
import { missionTitles, missions, relationLabels } from "../../content/missions";
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

const STEP_GUIDANCE: Partial<Record<SessionStep, string>> = {
  READ: "문단 전체를 먼저 읽고, 처음 느낌을 기록해요.",
  TOPIC: "전체 문장을 아우르는 중심 생각을 찾아요.",
  ORDER: "시간과 관계를 살펴 문장 띠를 다시 놓아요.",
  RELEVANCE: "문단의 흐름과 맞지 않는 문장을 분리해요.",
  CONNECTOR: "앞뒤 문장을 이어 주는 표현을 골라요.",
  EXPLAIN: "내가 고친 근거를 한 번 더 확인해요.",
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
    <section className="workbench" aria-labelledby="workbench-title">
      <header className="workbench__header">
        <div>
          <p className="section-label">현재 미션</p>
          <h1 id="workbench-title" tabIndex={-1} ref={headingRef} className="screen-title">
            {state.missionIndex + 1}번 미션 · {missionTitles[mission.id]}
          </h1>
          <p className="workbench__mission-context">문단의 흐름을 읽고 근거로 수리하는 시간이에요.</p>
        </div>
        <div className="workbench__status" aria-label="미션 진행 상태">
          <strong>미션 {state.missionIndex + 1} / {missions.length}</strong>
          <span className="mission-relation">{relationLabels[mission.relation]}</span>
        </div>
      </header>

      <section className="workbench__progress" aria-labelledby="step-title">
        <div className="workbench__progress-copy">
          <p className="section-label">작업 순서</p>
          <h2 id="step-title" className="step-title">{STEP_TITLES[state.step] ?? state.step}</h2>
          <p>{STEP_GUIDANCE[state.step]}</p>
        </div>
        <ProgressSteps current={state.step} />
      </section>

      <section className="workbench__surface" aria-label="현재 작업">
        <aside className="workbench__guide">
          <span className="workbench__guide-mark" aria-hidden="true">{String(state.missionIndex + 1).padStart(2, "0")}</span>
          <p className="section-label">수리 메모</p>
          <p>정답을 빨리 찾기보다 문장 안의 단서를 따라가 보세요.</p>
          <p className="workbench__guide-note">판단한 내용은 이번 탭의 기록에만 남아요.</p>
        </aside>
        <div className="workbench__task">
          {state.step === "READ" && <ReadStep {...stepProps} />}
          {state.step === "TOPIC" && <TopicStep {...stepProps} />}
          {state.step === "ORDER" && <OrderStep {...stepProps} />}
          {state.step === "RELEVANCE" && <RelevanceStep {...stepProps} />}
          {state.step === "CONNECTOR" && <ConnectorStep {...stepProps} />}
          {state.step === "EXPLAIN" && <ExplainStep {...stepProps} />}
        </div>
      </section>

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
