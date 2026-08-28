import { useState } from "react";

/** 글자 크기 도구. 세션 메모리만 사용하고 저장하지 않는다. */
export default function AccessibilityToolbar() {
  const [largeText, setLargeText] = useState(false);

  const toggle = () => {
    const next = !largeText;
    setLargeText(next);
    document.documentElement.classList.toggle("text-large", next);
  };

  return (
    <div className="a11y-toolbar" role="group" aria-label="화면 도구">
      <button
        type="button"
        className="action-button action-button--ghost"
        aria-pressed={largeText}
        onClick={toggle}
      >
        글자 크게
      </button>
    </div>
  );
}
