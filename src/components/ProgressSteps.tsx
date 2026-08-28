import type { SessionStep } from "../domain/types";

const LEARNING_STEPS: ReadonlyArray<{ step: SessionStep; label: string }> = [
  { step: "READ", label: "전체 읽기" },
  { step: "TOPIC", label: "중심 문장" },
  { step: "ORDER", label: "순서 수리" },
  { step: "RELEVANCE", label: "관련성 점검" },
  { step: "CONNECTOR", label: "이어 주는 말" },
  { step: "EXPLAIN", label: "수리 이유" },
];

interface ProgressStepsProps {
  readonly current: SessionStep;
}

export default function ProgressSteps({ current }: ProgressStepsProps) {
  const currentIndex = LEARNING_STEPS.findIndex((s) => s.step === current);
  return (
    <ol className="progress-steps" aria-label="학습 단계">
      {LEARNING_STEPS.map(({ step, label }, index) => {
        const state =
          index === currentIndex ? "current" : index < currentIndex ? "done" : "upcoming";
        return (
          <li
            key={step}
            className={`progress-steps__item progress-steps__item--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="progress-steps__label">{label}</span>
            {state === "done" && <span className="sr-only">(완료)</span>}
          </li>
        );
      })}
    </ol>
  );
}
