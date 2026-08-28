import { useState } from "react";
import { feedbackText, initialOrderIds } from "../../../content/missions";
import { evaluateConnector } from "../../../domain/paragraphEvaluator";
import type { ConnectorEvaluation } from "../../../domain/types";
import FeedbackPanel from "../FeedbackPanel";
import { ATTEMPTS_BEFORE_DEFERRAL, type StepProps } from "../stepTypes";

export default function ConnectorStep({ mission, record, dispatch }: StepProps) {
  const order = record.orderIds ?? initialOrderIds[mission.id];
  const offTopic = new Set(mission.offTopicSentenceIds);
  const coreOrder = order.filter((id) => !offTopic.has(id));
  const sentenceById = new Map(mission.sentences.map((s) => [s.id, s]));

  const frontSentence = sentenceById.get(coreOrder[0] ?? "")!;
  const backSentence = sentenceById.get(coreOrder[1] ?? "")!;

  const [selected, setSelected] = useState<string | null>(record.connectorId ?? null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<ConnectorEvaluation | null>(null);

  const confirm = () => {
    if (!selected) return;
    dispatch({
      type: "SET_CONNECTOR",
      missionIndex: record.missionIndex,
      connectorId: selected,
      revision: record.revision,
    });
    setFeedback(evaluateConnector(mission, selected));
    setAttempts((a) => a + 1);
  };

  const deferred = feedback !== null && !feedback.accepted && attempts >= ATTEMPTS_BEFORE_DEFERRAL;

  return (
    <div>
      <p className="workbench-hint">
        수리한 문단의 앞뒤 문장을 읽고, 관계에 맞는 이어 주는 말을 골라요.
      </p>

      <div className="connector-pair">
        <div className="sentence-card">
          <strong className="connector-pair__tag">앞 문장</strong>
          <span className="sentence-card__text">{frontSentence.text}</span>
        </div>
        <div className="sentence-card">
          <strong className="connector-pair__tag">뒷 문장</strong>
          <span className="sentence-card__text">{backSentence.text}</span>
        </div>
      </div>

      <ul className="choice-list">
        {mission.connectorOptions.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className="choice-button"
              aria-pressed={selected === option.id}
              onClick={() => {
                setSelected(option.id);
                setFeedback(null);
              }}
            >
              <span className="choice-button__mark" aria-hidden="true">
                {selected === option.id ? "✓" : ""}
              </span>
              {option.text}
              {selected === option.id && <span className="choice-button__state">선택됨</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="workbench-actions">
        <button
          type="button"
          className="action-button action-button--primary"
          disabled={!selected}
          onClick={confirm}
        >
          선택 완료
        </button>
      </div>

      {feedback?.accepted && (
        <FeedbackPanel
          tone="success"
          title="관계에 맞는 표현을 골랐어요!"
          items={[
            {
              key: "connector.accepted",
              label: "근거",
              text: feedbackText("connector.accepted"),
            },
          ]}
        >
          <button
            type="button"
            className="action-button action-button--primary"
            onClick={() => dispatch({ type: "ADVANCE" })}
          >
            다음 단계로
          </button>
        </FeedbackPanel>
      )}

      {feedback && !feedback.accepted && !deferred && (
        <FeedbackPanel
          tone="checking"
          title="다시 확인해 볼까요?"
          summary="앞 문장과 뒷 문장을 함께 다시 읽어 보세요."
          items={[
            {
              key: "connector.rejected",
              label: "근거",
              text: feedbackText("connector.rejected"),
            },
          ]}
        />
      )}

      {feedback && !feedback.accepted && deferred && (
        <FeedbackPanel
          tone="checking"
          title="함께 다시 볼 근거예요"
          summary="지금 고른 표현을 기록에 남기고 다음 단계로 가요."
          items={[
            {
              key: "connector.rejected",
              label: "근거",
              text: feedbackText("connector.rejected"),
            },
          ]}
        >
          <button
            type="button"
            className="action-button action-button--primary"
            onClick={() => dispatch({ type: "ADVANCE" })}
          >
            다음 단계로
          </button>
        </FeedbackPanel>
      )}

      {feedback?.accepted && (
        <section className="completed-paragraph" aria-label="완성 문단">
          <h3 className="section-title">완성 문단</h3>
          <p className="completed-paragraph__text">
            {coreOrder.map((id, index) => (
              <span key={id}>
                {sentenceById.get(id)!.text}
                {index < coreOrder.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <p className="workbench-hint">
            선택한 이어 주는 말:{" "}
            <strong>
              {mission.connectorOptions.find((o) => o.id === selected)?.text ?? ""}
            </strong>{" "}
            — 앞 문장과 뒷 문장을 잇는 말로 쓸 수 있어요.
          </p>
        </section>
      )}
    </div>
  );
}
