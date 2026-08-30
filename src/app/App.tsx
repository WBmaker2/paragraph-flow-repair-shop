import { useEffect, useReducer, useRef, type RefObject } from "react";
import { createInitialSessionState, sessionReducer } from "./sessionReducer";
import type { SessionStep } from "../domain/types";
import AccessibilityToolbar from "../accessibility/AccessibilityToolbar";
import UpdateHistoryButton from "../components/UpdateHistoryButton";
import EntranceScreen from "../features/paragraph-repair/EntranceScreen";
import ParagraphWorkbench from "../features/paragraph-repair/ParagraphWorkbench";
import LearningReport from "../features/report/LearningReport";
import AmbientToolkit from "../features/paragraph-repair/AmbientToolkit";
import "../features/report/print.css";
import workbenchBackground from "../assets/generated/repair-desk-atmosphere-v2.webp";

/** 단계가 바뀌면 제목으로 초점을 옮기고, reduced motion에서는 즉시 시작점으로 이동한다. */
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
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      heading.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [headingRef, step, missionIndex]);
}

export default function App() {
  const [state, dispatch] = useReducer(sessionReducer, undefined, createInitialSessionState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useStepFocus(headingRef, state.step, state.missionIndex);

  return (
    <div
      className="app-shell"
      style={{ backgroundImage: `url(${workbenchBackground})` }}
    >
      <a className="skip-link" href="#main-content">
        본문으로 건너뛰기
      </a>
      <header className="app-header">
        <div className="app-header__brand" aria-label="문단 흐름 수리소">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" role="presentation">
              <path d="M6 9.5 16 5l10 4.5v15H6z" />
              <path d="M10 13h12M10 17h7M10 21h10" />
              <path d="m22 22 4-4 2 2-4 4-3 1z" />
            </svg>
          </span>
          <span>
            <span className="app-header__brand-name">문단 흐름 수리소</span>
            <span className="app-header__brand-note">교정지 여백 작업대</span>
          </span>
        </div>
        <p className="app-header__tagline">문단을 읽고, 근거로 고쳐요.</p>
        <div className="app-header__tools">
          <AccessibilityToolbar />
          <UpdateHistoryButton />
        </div>
      </header>
      {state.step === "INTRO" && <AmbientToolkit />}
      <main id="main-content" className="app-main">
        {state.step === "INTRO" && (
          <EntranceScreen onStart={() => dispatch({ type: "START_SESSION" })} showHistory={false} />
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
