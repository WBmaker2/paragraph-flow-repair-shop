import { useState } from "react";
import ActionButton from "../../../components/ActionButton";
import { relationLabels } from "../../../content/missions";
import type { Relation } from "../../../domain/types";
import type { StepProps } from "../stepTypes";

const RELATIONS = Object.keys(relationLabels) as Relation[];

export default function ExplainStep({ record, dispatch }: StepProps) {
  const [relation, setRelation] = useState<Relation | null>(record.relationLabel ?? null);
  const [reason, setReason] = useState(record.reasonText ?? "");

  const chooseRelation = (value: Relation) => {
    setRelation(value);
    dispatch({
      type: "SET_EXPLAIN",
      missionIndex: record.missionIndex,
      relationLabel: value,
      reasonText: reason,
      revision: record.revision,
    });
  };

  const complete = () => {
    if (relation === null) return;
    dispatch({
      type: "SET_EXPLAIN",
      missionIndex: record.missionIndex,
      relationLabel: relation,
      reasonText: reason,
      revision: record.revision,
    });
    dispatch({ type: "ADVANCE" });
  };

  return (
    <div>
      <p className="workbench-hint">
        이 문단의 문장들은 어떤 관계로 이어져 있나요? 근거가 될 관계를 골라요.
      </p>

      <ul className="choice-list">
        {RELATIONS.map((value) => (
          <li key={value}>
            <button
              type="button"
              className="choice-button"
              aria-pressed={relation === value}
              onClick={() => chooseRelation(value)}
            >
              <span className="choice-button__mark" aria-hidden="true">
                {relation === value ? "✓" : ""}
              </span>
              {relationLabels[value]}
              {relation === value && <span className="choice-button__state">선택됨</span>}
            </button>
          </li>
        ))}
      </ul>

      <label className="explain__reason-label" htmlFor="explain-reason">
        수리 이유 (선택)
      </label>
      <textarea
        id="explain-reason"
        className="explain__reason"
        aria-label="수리 이유 자유 설명 (선택)"
        rows={3}
        value={reason}
        placeholder="예: 먼저, 그다음 단서를 보고 순서를 바꿨어요."
        onChange={(event) => setReason(event.target.value)}
      />

      <div className="workbench-actions">
        <ActionButton pulse disabled={relation === null} onClick={complete}>
          수리 완료 확인
        </ActionButton>
      </div>
    </div>
  );
}
