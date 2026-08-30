import { useState } from "react";
import ActionButton from "../../../components/ActionButton";
import { feedbackText } from "../../../content/missions";
import { evaluateOffTopic } from "../../../domain/paragraphEvaluator";
import type { OffTopicEvaluation } from "../../../domain/types";
import FeedbackPanel from "../FeedbackPanel";
import { ATTEMPTS_BEFORE_DEFERRAL, type StepProps } from "../stepTypes";

export default function RelevanceStep({ mission, record, dispatch }: StepProps) {
  const [moved, setMoved] = useState<string[]>(() => [...(record.removedSentenceIds ?? [])]);
  const [declaredNone, setDeclaredNone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<OffTopicEvaluation | null>(null);

  const sentenceById = new Map(mission.sentences.map((s) => [s.id, s]));
  const inStrip = mission.sentences.filter((s) => !moved.includes(s.id));
  const inBox = moved.map((id) => sentenceById.get(id)!).filter(Boolean);

  const completeDisabled = moved.length === 0 && !declaredNone;

  const complete = () => {
    dispatch({
      type: "SET_REMOVED",
      missionIndex: record.missionIndex,
      removedIds: moved,
      revision: record.revision,
    });
    setFeedback(evaluateOffTopic(mission, moved));
    setAttempts((a) => a + 1);
  };

  const deferred = feedback !== null && !feedback.accepted && attempts >= ATTEMPTS_BEFORE_DEFERRAL;

  const evidenceItems = feedback
    ? [
        ...feedback.missingIds.map((id) => ({
          key: `missing-${id}`,
          label: "보관함을 다시 볼까요?",
          text: feedbackText("offtopic.missing"),
        })),
        ...feedback.wrongIds.map((id) => ({
          key: `wrong-${id}`,
          label: `‘${sentenceById.get(id)?.text ?? id}’`,
          text: feedbackText("offtopic.wrong"),
        })),
      ]
    : [];

  return (
    <div>
      <p className="workbench-hint">
        문단의 흐름과 관계없는 문장을 찾으면 보관함으로 옮겨요. 없다면 없다고 표시해요.
      </p>

      <ul className="sentence-strip" aria-label="문장 작업대">
        {inStrip.map((sentence) => (
          <li key={sentence.id} className="sentence-card">
            <span className="sentence-card__text">{sentence.text}</span>
            <span className="sentence-card__controls">
              <button
                type="button"
                className="action-button action-button--secondary"
                aria-label={`${sentence.text} 보관함으로 옮기기`}
                onClick={() => {
                  setFeedback(null);
                  setMoved((current) => [...current, sentence.id]);
                  setDeclaredNone(false);
                }}
              >
                보관함으로
              </button>
            </span>
          </li>
        ))}
      </ul>

      <fieldset className="storage-box" role="group" aria-label="관련 없는 문장 보관함">
        <legend className="storage-box__title">관련 없는 문장 보관함</legend>
        {inBox.length === 0 && <p className="workbench-hint">아직 비어 있어요.</p>}
        <ul className="sentence-strip">
          {inBox.map((sentence) => (
            <li key={sentence.id} className="sentence-card sentence-card--offtopic-moved">
              <span className="sentence-card__text">{sentence.text}</span>
              <span className="sentence-card__controls">
                <button
                  type="button"
                  className="action-button action-button--ghost"
                  aria-label={`${sentence.text} 문단으로 돌리기`}
                  onClick={() => {
                    setFeedback(null);
                    setMoved((current) => current.filter((id) => id !== sentence.id));
                  }}
                >
                  문단으로 돌리기
                </button>
              </span>
            </li>
          ))}
        </ul>
      </fieldset>

      <button
        type="button"
        className="choice-button"
        aria-pressed={declaredNone}
        onClick={() => {
          setDeclaredNone((v) => !v);
          setFeedback(null);
        }}
      >
        <span className="choice-button__mark" aria-hidden="true" />
        벗어난 문장이 없어요
        {declaredNone && <span className="choice-button__state">선택됨</span>}
      </button>

      <div className="workbench-actions">
        <ActionButton
          pulse={feedback === null}
          disabled={completeDisabled}
          onClick={complete}
        >
          관련성 점검 완료
        </ActionButton>
      </div>

      {feedback?.accepted && (
        <FeedbackPanel tone="success" title="문단이 깔끔해졌어요!" items={[]}>
          <ActionButton
            pulse
            onClick={() => dispatch({ type: "ADVANCE" })}
          >
            다음 단계로
          </ActionButton>
        </FeedbackPanel>
      )}

      {feedback && !feedback.accepted && !deferred && (
        <FeedbackPanel
          tone="checking"
          title="다시 확인해 볼까요?"
          summary="보관함에서 문단으로 돌리거나, 다른 문장을 옮겨 볼 수 있어요."
          items={evidenceItems}
        />
      )}

      {feedback && !feedback.accepted && deferred && (
        <FeedbackPanel
          tone="checking"
          title="함께 다시 볼 근거예요"
          summary="지금 상태를 기록에 남기고 다음 단계로 가요."
          items={evidenceItems}
        >
          <ActionButton
            pulse
            onClick={() => dispatch({ type: "ADVANCE" })}
          >
            다음 단계로
          </ActionButton>
        </FeedbackPanel>
      )}
    </div>
  );
}
