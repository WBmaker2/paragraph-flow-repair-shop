import { useState } from "react";
import ActionButton from "../../../components/ActionButton";
import { feedbackText, initialOrderIds } from "../../../content/missions";
import { evaluateOrder } from "../../../domain/paragraphEvaluator";
import type { ParagraphEvaluation } from "../../../domain/types";
import FeedbackPanel from "../FeedbackPanel";
import { ATTEMPTS_BEFORE_DEFERRAL, type StepProps } from "../stepTypes";

export default function OrderStep({ mission, record, dispatch }: StepProps) {
  const [order, setOrder] = useState<string[]>(() => [
    ...(record.orderIds ?? initialOrderIds[mission.id]),
  ]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<ParagraphEvaluation | null>(null);
  const sentenceById = new Map(mission.sentences.map((s) => [s.id, s]));

  /** 가장자리에서는 동작하지 않는다. 버튼을 비활성화하지 않아 키보드 초점이 유지된다. */
  const reorder = (id: string, to: number) => {
    setOrder((current) => {
      const from = current.indexOf(id);
      if (from < 0 || to < 0 || to >= current.length || to === from) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next;
    });
  };

  const move = (id: string, direction: -1 | 1) => {
    setFeedback(null);
    const from = order.indexOf(id);
    reorder(id, from + direction);
  };

  const moveTo = (id: string, position: number) => {
    setFeedback(null);
    const to = Math.min(Math.max(position - 1, 0), order.length - 1);
    reorder(id, to);
  };

  const test = () => {
    dispatch({
      type: "SET_ORDER",
      missionIndex: record.missionIndex,
      orderIds: order,
      revision: record.revision,
    });
    setFeedback(evaluateOrder(mission, order));
    setAttempts((a) => a + 1);
  };

  const deferred = feedback !== null && !feedback.accepted && attempts >= ATTEMPTS_BEFORE_DEFERRAL;

  const evidenceItems = feedback
    ? [
        ...feedback.brokenPairs.map((key) => ({
          key: `broken-${key}`,
          label: "다시 볼 관계",
          text: feedbackText(key),
        })),
        ...feedback.satisfiedPairs.map((key) => ({
          key: `ok-${key}`,
          label: "맞게 이어진 관계",
          text: feedbackText(key),
        })),
      ]
    : [];

  return (
    <div>
      <ul className="sentence-strip" aria-label="문장 작업대">
        {order.map((id, index) => {
          const sentence = sentenceById.get(id)!;
          return (
            <li key={id} className="sentence-card sentence-card--reorder">
              <span className="sentence-card__position" aria-hidden="true">
                {index + 1}
              </span>
              <label className="sr-only" htmlFor={`position-${id}`}>
                {sentence.text} 위치 번호
              </label>
              <input
                id={`position-${id}`}
                className="position-input"
                type="number"
                min={1}
                max={order.length}
                value={index + 1}
                onChange={(event) => moveTo(id, Number(event.target.value))}
              />
              <span className="sentence-card__text">{sentence.text}</span>
              <span className="sentence-card__controls">
                <button
                  type="button"
                  className="move-button"
                  aria-label={`${sentence.text} 위로 이동`}
                  onClick={() => move(id, -1)}
                >
                  위
                </button>
                <button
                  type="button"
                  className="move-button"
                  aria-label={`${sentence.text} 아래로 이동`}
                  onClick={() => move(id, 1)}
                >
                  아래
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="workbench-actions">
        <ActionButton pulse={feedback === null} onClick={test}>
          문단 시험하기
        </ActionButton>
      </div>

      {feedback?.accepted && (
        <FeedbackPanel tone="success" title="문단이 자연스럽게 이어져요!" items={evidenceItems}>
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
          summary="위·아래 버튼으로 한 번 더 옮겨 볼 수 있어요."
          items={evidenceItems}
        />
      )}

      {feedback && !feedback.accepted && deferred && (
        <FeedbackPanel
          tone="checking"
          title="함께 다시 볼 근거예요"
          summary="지금 순서를 기록에 남기고 다음 단계로 가요."
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
