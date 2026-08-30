import { useState, type Dispatch, type RefObject } from "react";
import type { SessionAction, SessionState } from "../../app/sessionReducer";
import {
  feedbackText,
  initialOrderIds,
  missions,
  missionTitles,
  relationLabels,
} from "../../content/missions";
import {
  evaluateConnector,
  evaluateOffTopic,
  evaluateOrder,
  evaluateTopic,
} from "../../domain/paragraphEvaluator";
import ModalDialog from "../../components/ModalDialog";

interface LearningReportProps {
  readonly state: SessionState;
  readonly dispatch: Dispatch<SessionAction>;
  readonly headingRef: RefObject<HTMLHeadingElement>;
}

const FIRST_JUDGMENT_LABEL = {
  natural: "자연스러웠어요",
  "needs-repair": "고쳐야 할 것 같았어요",
} as const;

function OrderList({
  title,
  orderIds,
  texts,
}: {
  title: string;
  orderIds: readonly string[];
  texts: Readonly<Record<string, string>>;
}) {
  return (
    <section className="report-order__column">
      <h4 className="report-order__heading">{title}</h4>
      <ol className="sentence-strip" aria-label={title}>
        {orderIds.map((id, index) => (
          <li key={`${title}-${id}`} className="sentence-card">
            <span className="sentence-card__position" aria-hidden="true">
              {index + 1}
            </span>
            <span className="sentence-card__text">{texts[id]}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function LearningReport({ state, dispatch, headingRef }: LearningReportProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="report-page" aria-labelledby="report-title">
      <header className="report-header">
        <div>
          <p className="section-label">세션 기록</p>
          <h1 id="report-title" tabIndex={-1} ref={headingRef} className="screen-title">
            수리 기록
          </h1>
          <p className="workbench-hint">
            여기에는 채점이 없어요. 처음 판단과 사용한 근거, 고친 결과를 미션별로 모았어요.
          </p>
        </div>
        <span className="report-header__count">6개 미션</span>
      </header>

      <div className="report-summary" aria-label="이번 세션 요약">
        <div><strong>처음 판단</strong><span>내가 읽은 첫 느낌</span></div>
        <div><strong>최종 수리</strong><span>문장과 관계를 다시 놓은 결과</span></div>
        <div><strong>근거 기록</strong><span>다음 글에도 가져갈 생각</span></div>
      </div>

      {state.records.map((record, index) => {
        const mission = missions[index]!;
        const texts = Object.fromEntries(mission.sentences.map((s) => [s.id, s.text]));
        const initial = initialOrderIds[mission.id];
        const finalOrder = record.orderIds ?? initial;

        const topicResult = record.topicSentenceId
          ? evaluateTopic(mission, record.topicSentenceId)
          : null;
        const orderResult = evaluateOrder(mission, finalOrder);
        const relevanceResult =
          record.removedSentenceIds !== undefined
            ? evaluateOffTopic(mission, record.removedSentenceIds)
            : null;
        const connectorResult = record.connectorId
          ? evaluateConnector(mission, record.connectorId)
          : null;

        const evidence = [
          ...orderResult.brokenPairs.map((key) => ({
            key: `broken-${key}`,
            label: "다시 볼 관계",
            text: feedbackText(key),
          })),
          ...orderResult.satisfiedPairs.map((key) => ({
            key: `ok-${key}`,
            label: "맞게 이어진 관계",
            text: feedbackText(key),
          })),
          ...(topicResult && !topicResult.accepted
            ? [{ key: "topic", label: "중심 문장", text: feedbackText("topic.rejected") }]
            : []),
          ...(relevanceResult && !relevanceResult.accepted
            ? [{ key: "relevance", label: "관련성", text: feedbackText("offtopic.missing") }]
            : []),
          ...(connectorResult && !connectorResult.accepted
            ? [{ key: "connector", label: "이어 주는 말", text: feedbackText("connector.rejected") }]
            : []),
        ];

        const removedTexts = (record.removedSentenceIds ?? []).map(
          (id) => texts[id] ?? "",
        );

        return (
          <article key={mission.id} className="report-mission" aria-label={`${index + 1}번 미션`}>
            <header className="report-mission__header">
              <div>
                <p className="section-label">미션 {String(index + 1).padStart(2, "0")}</p>
                <h3>{missionTitles[mission.id]}</h3>
              </div>
              <p className="report-mission__relation">관계: {relationLabels[mission.relation]}</p>
            </header>

            <div className="report-order">
              <OrderList title={`${index + 1}번 미션 처음 순서`} orderIds={initial} texts={texts} />
              <OrderList title={`${index + 1}번 미션 최종 순서`} orderIds={finalOrder} texts={texts} />
            </div>

            <ul className="report-facts">
              <li>
                처음 판단: {record.firstJudgment ? FIRST_JUDGMENT_LABEL[record.firstJudgment] : "기록 없음"}
              </li>
              <li>
                중심 문장:{" "}
                {record.topicSentenceId ? texts[record.topicSentenceId] : "기록 없음"}
                {topicResult?.accepted === false ? " (함께 다시 볼 문장)" : ""}
              </li>
              <li>
                보관한 문장: {removedTexts.length > 0 ? removedTexts.join(" / ") : "없음"}
              </li>
              <li>
                이어 주는 말:{" "}
                {record.connectorId
                  ? mission.connectorOptions.find((o) => o.id === record.connectorId)?.text ?? "기록 없음"
                  : "기록 없음"}
              </li>
              <li>선택한 관계: {record.relationLabel ? relationLabels[record.relationLabel] : "기록 없음"}</li>
              <li>남긴 이유: {record.reasonText ? record.reasonText : "없음"}</li>
            </ul>

            <h4 className="report-order__heading">수리 근거</h4>
            <ul className="report-evidence" aria-label={`${index + 1}번 미션 수리 근거`}>
              {evidence.map((item) => (
                <li key={item.key}>
                  <strong>{item.label}</strong> {item.text}
                </li>
              ))}
            </ul>
          </article>
        );
      })}

      <div className="report-notice">
        <p>여러분의 기록은 이 탭에만 있어요. 새로고침하면 사라져요.</p>
        <p>
          이 앱의 문단과 판정은 국어 교사 검수 중이며, 교육 모형은 실제 세계 전체를 보장하지 않아요.
        </p>
      </div>

      <div className="report-actions print-hide">
        <button type="button" className="action-button action-button--primary" onClick={() => window.print()}>
          인쇄하기
        </button>
        <button
          type="button"
          className="action-button action-button--secondary"
          onClick={() => setConfirmOpen(true)}
        >
          처음부터 다시 하기
        </button>
      </div>

      <ModalDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="처음부터 다시 할까요?">
        <p>지금까지의 기록이 모두 지워져요. 괜찮아요?</p>
        <div className="dialog__footer">
          <button
            type="button"
            className="action-button action-button--secondary"
            onClick={() => setConfirmOpen(false)}
          >
            취소
          </button>
          <button
            type="button"
            className="action-button action-button--primary"
            onClick={() => {
              setConfirmOpen(false);
              dispatch({ type: "RESTART_CONFIRMED" });
            }}
          >
            다시 시작할게요
          </button>
        </div>
      </ModalDialog>
    </section>
  );
}
