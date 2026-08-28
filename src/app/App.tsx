import { useEffect, useReducer, useRef, type RefObject } from "react";
import { createInitialSessionState, sessionReducer } from "./sessionReducer";
import type { SessionStep } from "../domain/types";
import AccessibilityToolbar from "../accessibility/AccessibilityToolbar";
import UpdateHistoryButton from "../components/UpdateHistoryButton";
import EntranceScreen from "../features/paragraph-repair/EntranceScreen";
import ParagraphWorkbench from "../features/paragraph-repair/ParagraphWorkbench";
import LearningReport from "../features/report/LearningReport";
import "../features/report/print.css";

/** 단계가 바뀌면 mainHeadingRef로 초점을 옮기고 시작점으로 스크롤한다(계획 문서 §3). */
function useStepFocus(headingRef: RefObject<HTMLHeadingElement>, step: SessionStep, missionIndex: number) {
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const heading = headingRef.current;
    if (!heading) return;
    heading.focus();
    if (typeof heading.scrollIntoView === "function") {
      heading.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [headingRef, step, missionIndex]);
}

export default function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialSessionState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useStepFocus(headingRef, state.step, state.missionIndex);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__brand">문단 흐름 수리소</span>
        <div className="app-header__tools">
          <AccessibilityToolbar />
          <UpdateHistoryButton />
        </div>
      </header>
      <main>
        {state.step === "INTRO" && (
          <EntranceScreen onStart={() => dispatch({ type: "START_SESSION" })} />
        )}
        {state.step !== "INTRO" && state.step !== "REPORT" && (
          <ParagraphWorkbench
            key={`${state.missionIndex}-${state.step}`}
            state={state}
            dispatch={dispatch}
            headingRef={headingRef}
          />
        )}
        {state.step === "REPORT" && (
          <LearningReport key="report" state={state} dispatch={dispatch} headingRef={headingRef} />
        )}
      </main>
    </div>
  );
}
