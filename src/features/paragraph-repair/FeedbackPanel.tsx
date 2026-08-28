import type { ReactNode } from "react";

export interface FeedbackItem {
  readonly key: string;
  readonly label: string;
  readonly text: string;
}

interface FeedbackPanelProps {
  readonly tone: "success" | "checking";
  readonly title: string;
  readonly summary?: string;
  readonly items: readonly FeedbackItem[];
  readonly children?: ReactNode;
}

/** 판정 피드백. 정답 배열을 공개하지 않고 근거 문구만 보여 준다(계획 문서 Task 5). */
export default function FeedbackPanel({ tone, title, summary, items, children }: FeedbackPanelProps) {
  return (
    <section className={`feedback-panel feedback-panel--${tone}`} role="status">
      <h3 className="feedback-panel__title">{title}</h3>
      {summary && <p>{summary}</p>}
      {items.length > 0 && (
        <ul className="feedback-panel__list">
          {items.map((item) => (
            <li key={item.key}>
              <strong>{item.label}</strong> {item.text}
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}
