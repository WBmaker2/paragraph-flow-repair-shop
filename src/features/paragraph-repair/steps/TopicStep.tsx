import { useState } from "react";
import { feedbackText } from "../../../content/missions";
import { evaluateTopic } from "../../../domain/paragraphEvaluator";
import FeedbackPanel from "../FeedbackPanel";
import { ATTEMPTS_BEFORE_DEFERRAL, type StepProps } from "../stepTypes";

export default function TopicStep({ mission, record, dispatch }: StepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(record.topicSentenceId ?? null);
  const [attempts, setAttempts] = useState(0);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  const choose = (sentenceId: string) => {
    setSelectedId(sentenceId);
    setAccepted(null);
    dispatch({
      type: "SET_TOPIC",
      missionIndex: record.missionIndex,
      sentenceId,
      revision: record.revision,
    });
  };

  const confirm = () => {
    if (!selectedId) return;
    const result = evaluateTopic(mission, selectedId);
    setAttempts((a) => a + 1);
    setAccepted(result.accepted);
  };

  const deferred = accepted === false && attempts >= ATTEMPTS_BEFORE_DEFERRAL;
  const evidence = [{ key: "topic", label: "근거", text: feedbackText(accepted ? "topic.accepted" : "topic.rejected") }];

  return (
    <div>
      <p className="workbench-hint">문단의 중심 생각을 가장 잘 담은 문장을 골라요.</p>
      <ul className="choice-list">
        {mission.sentences.map((sentence) => (
          <li key={sentence.id}>
            <button
              type="button"
              className="choice-button"
              aria-pressed={selectedId === sentence.id}
              onClick={() => choose(sentence.id)}
            >
              <span className="choice-button__mark" aria-hidden="true">
                {selectedId === sentence.id ? "✓" : ""}
              </span>
              {sentence.text}
              {selectedId === sentence.id && <span className="choice-button__state">선택됨</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="workbench-actions">
        <button
          type="button"
          className="action-button action-button--primary"
          disabled={!selectedId}
          onClick={confirm}
        >
          고르기 완료
        </button>
      </div>

      {accepted === true && (
        <FeedbackPanel tone="success" title="중심 문장을 찾았어요!" items={evidence}>
          <button
            type="button"
            className="action-button action-button--primary"
            onClick={() => dispatch({ type: "ADVANCE" })}
          >
            다음 단계로
          </button>
        </FeedbackPanel>
      )}

      {accepted === false && !deferred && (
        <FeedbackPanel tone="checking" title="다시 확인해 볼까요?" items={evidence} />
      )}

      {deferred && (
        <FeedbackPanel
          tone="checking"
          title="함께 다시 볼 근거예요"
          summary="지금 고른 문장을 기록에 남겨 두고 다음 단계로 가요."
          items={evidence}
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
    </div>
  );
}
