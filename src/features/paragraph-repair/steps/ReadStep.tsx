import { useState } from "react";
import ActionButton from "../../../components/ActionButton";
import { initialOrderIds } from "../../../content/missions";
import type { FirstJudgment } from "../../../domain/types";
import type { StepProps } from "../stepTypes";

const JUDGMENT_OPTIONS: ReadonlyArray<{ value: FirstJudgment; label: string }> = [
  { value: "natural", label: "자연스러워요" },
  { value: "needs-repair", label: "고쳐야 할 것 같아요" },
];

export default function ReadStep({ mission, record, dispatch }: StepProps) {
  const [judgment, setJudgment] = useState<FirstJudgment | null>(record.firstJudgment ?? null);
  const initialOrder = initialOrderIds[mission.id];

  return (
    <div>
      <ul className="sentence-strip" aria-label="처음 문장 띠">
        {initialOrder.map((id, index) => {
          const sentence = mission.sentences.find((s) => s.id === id)!;
          return (
            <li key={id} className="sentence-card">
              <span className="sentence-card__position" aria-hidden="true">
                {index + 1}
              </span>
              <span className="sentence-card__text">{sentence.text}</span>
            </li>
          );
        })}
      </ul>

      <fieldset className="choice-fieldset">
        <legend>문단을 읽어 보고 처음 판단을 남겨요.</legend>
        <div className="choice-list">
          {JUDGMENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className="choice-button"
              aria-pressed={judgment === value}
              onClick={() => {
                setJudgment(value);
                dispatch({
                  type: "SET_FIRST_JUDGMENT",
                  missionIndex: record.missionIndex,
                  judgment: value,
                  revision: record.revision,
                });
              }}
            >
              <span className="choice-button__mark" aria-hidden="true" />
              {label}
              {judgment === value && <span className="choice-button__state">선택됨</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="workbench-actions">
        <ActionButton
          pulse
          disabled={judgment === null}
          onClick={() => dispatch({ type: "ADVANCE" })}
        >
          다음
        </ActionButton>
      </div>
    </div>
  );
}
