import type { RefObject } from "react";
import type { SessionState } from "../../app/sessionReducer";
import { missionTitles, missions } from "../../content/missions";
import type { SessionStep } from "../../domain/types";
import ProgressSteps from "../../components/ProgressSteps";

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
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

/** Task 5에서 단계별 학습 UI로 확장되는 자리. 현재는 단계 이동 골격만 렌더링한다. */
export default function ParagraphWorkbench({ state, headingRef }: ParagraphWorkbenchProps) {
  const mission = missions[state.missionIndex]!;
  return (
    <section aria-labelledby="workbench-title">
      <h1 id="workbench-title" tabIndex={-1} ref={headingRef} className="screen-title">
        {state.missionIndex + 1}번 미션 · {missionTitles[mission.id]}
      </h1>
      <h2 className="step-title">{STEP_TITLES[state.step] ?? state.step}</h2>
      <ProgressSteps current={state.step} />
      <p className="workbench__placeholder">학습 화면은 곧 열려요.</p>
    </section>
  );
}
