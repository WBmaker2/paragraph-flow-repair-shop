import { useState } from "react";
import UpdateHistoryDialog from "../../components/UpdateHistoryDialog";
import { missionTitles, missions } from "../../content/missions";

interface EntranceScreenProps {
  readonly onStart: () => void;
}

const GOALS: readonly string[] = [
  "중심 문장과 나머지 문장을 구분해요.",
  "시간 순서, 원인과 결과, 비교, 문제와 해결을 문장 근거로 설명해요.",
  "이어 주는 말이 앞뒤 관계와 맞는지 확인해요.",
  "순서가 둘 이상일 수 있어요. 내 순서를 근거로 설명해요.",
];

export default function EntranceScreen({ onStart }: EntranceScreenProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <section className="entrance" aria-labelledby="entrance-title">
      <h1 id="entrance-title" className="screen-title entrance__title">
        문단 흐름 수리소
      </h1>
      <p className="entrance__goal" aria-label="학습 목표">
        문단은 문장이 모인 것이 아니라, <strong>중심 생각으로 이어진 글</strong>이에요.
        오늘은 문단 수리 기사가 되어 흐름이 깨진 문단을 고쳐 봐요.
      </p>

      <section className="entrance__block" aria-labelledby="entrance-goals">
        <h2 id="entrance-goals" className="section-title">
          수리 기사가 하는 일
        </h2>
        <ul className="goal-list">
          {GOALS.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="entrance__block" aria-labelledby="entrance-missions">
        <h2 id="entrance-missions" className="section-title">
          오늘 수리할 문단 6개
        </h2>
        <ol className="mission-list">
          {missions.map((mission, index) => (
            <li key={mission.id} className="mission-list__item">
              <span className="mission-list__number">{index + 1}</span>
              {missionTitles[mission.id]}
            </li>
          ))}
        </ol>
      </section>

      <section className="entrance__block entrance__notice" aria-label="이용 안내">
        <ul>
          <li>권장 활동 시간은 15~25분이에요. 서두르지 않아도 돼요.</li>
          <li>여러분의 답은 이 탭에만 남아요. 새로고침하면 사라져요.</li>
          <li>점수나 순위는 없어요. 처음 판단과 고친 근거를 기록해요.</li>
        </ul>
      </section>

      <div className="entrance__actions">
        <button type="button" className="action-button action-button--primary entrance__start" onClick={onStart}>
          활동 시작하기
        </button>
        <button
          type="button"
          className="action-button action-button--ghost"
          aria-haspopup="dialog"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen(true)}
        >
          업데이트 내역
        </button>
      </div>

      <UpdateHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </section>
  );
}
