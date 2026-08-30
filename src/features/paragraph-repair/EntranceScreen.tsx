import { useState } from "react";
import ActionButton from "../../components/ActionButton";
import UpdateHistoryDialog from "../../components/UpdateHistoryDialog";
import { initialOrderIds, missionTitles, missions, relationLabels } from "../../content/missions";

interface EntranceScreenProps {
  readonly onStart: () => void;
  readonly showHistory?: boolean;
}

const GOALS: readonly string[] = [
  "중심 문장과 나머지 문장을 구분해요.",
  "시간 순서, 원인과 결과, 비교, 문제와 해결을 문장 근거로 설명해요.",
  "이어 주는 말이 앞뒤 관계와 맞는지 확인해요.",
  "순서가 둘 이상일 수 있어요. 내 순서를 근거로 설명해요.",
];

export default function EntranceScreen({ onStart, showHistory = true }: EntranceScreenProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const firstMission = missions[0]!;
  const firstOrder = initialOrderIds[firstMission.id].filter(
    (id) => !firstMission.offTopicSentenceIds.includes(id),
  );

  return (
    <section className="entrance" aria-labelledby="entrance-title">
      <div className="entrance__layout">
        <div className="entrance__intro">
          <p className="section-label">오늘의 수리 목표</p>
          <h1 id="entrance-title" className="screen-title entrance__title">
            문단 흐름 수리소
          </h1>
          <h2 className="entrance__headline">
            문단을 읽고,
            <br />
            <span>근거로 고쳐요.</span>
          </h2>
          <p className="entrance__goal" aria-label="학습 목표">
            문단은 문장이 모인 것이 아니라, <strong>중심 생각으로 이어진 글</strong>이에요.
            오늘은 문단 수리 기사가 되어 흐름이 깨진 문단을 고쳐 봐요.
          </p>

          <div className="entrance__actions">
            <ActionButton pulse onClick={onStart} className="entrance__start">
              활동 시작하기
            </ActionButton>
            {showHistory && (
              <button
                type="button"
                className="action-button action-button--ghost"
                aria-haspopup="dialog"
                aria-expanded={historyOpen}
                onClick={() => setHistoryOpen(true)}
              >
                업데이트 내역
              </button>
            )}
          </div>
          <p className="entrance__time">권장 활동 시간 15~25분 · 서두르지 않아도 돼요.</p>

          <ul className="goal-list" aria-label="수리 기사가 하는 일">
            {GOALS.map((goal, index) => (
              <li key={goal}>
                <span className="goal-list__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="entrance__work-area">
          <section className="entrance__preview" aria-labelledby="entrance-preview-title">
            <div className="entrance__preview-heading">
              <span className="section-label">오늘의 첫 작업</span>
              <span className="entrance__preview-relation">{relationLabels[firstMission.relation]}</span>
            </div>
            <h2 id="entrance-preview-title">먼저 문단의 흐름을 읽어 보세요.</h2>
            <p>
              <strong>첫 번째 문단</strong>의 문장을 차례로 읽고, 어디에서 흐름이 달라지는지 살펴봐요.
            </p>
            <ol className="paragraph-preview" aria-label="첫 미션 문장 미리 보기">
              {firstOrder.map((id, index) => {
                const sentence = firstMission.sentences.find((item) => item.id === id)!;
                return (
                  <li key={id} className="paragraph-preview__item">
                    <span className="paragraph-preview__number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{sentence.text}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="entrance__mission-board" aria-labelledby="entrance-missions">
            <div className="entrance__board-header">
              <div>
                <span className="section-label">미션 목록</span>
                <h2 id="entrance-missions">오늘 수리할 문단 6개</h2>
              </div>
              <span className="entrance__board-note">차례대로 한 개씩</span>
            </div>
            <ol className="mission-list">
              {missions.map((mission, index) => (
                <li key={mission.id} className="mission-list__item">
                  <span className="mission-list__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mission-list__name">{missionTitles[mission.id]}</span>
                  <span className="mission-list__relation">{relationLabels[mission.relation]}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <section className="entrance__record" aria-labelledby="entrance-record-title">
        <div>
          <span className="section-label">이번에 기록하는 것</span>
          <h2 id="entrance-record-title">판단에서 근거까지</h2>
        </div>
        <ol className="record-flow">
          <li><span>01</span> 처음 판단</li>
          <li><span>02</span> 최종 수리</li>
          <li><span>03</span> 사용한 근거</li>
        </ol>
      </section>

      <section className="entrance__notice" aria-label="이용 안내">
        <p className="section-label">시작하기 전에</p>
        <ul>
          <li>여러분의 답은 이 탭에만 남아요. 새로고침하면 사라져요.</li>
          <li>점수나 순위는 없어요. 처음 판단과 고친 근거를 기록해요.</li>
        </ul>
      </section>

      {showHistory && <UpdateHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />}
    </section>
  );
}
