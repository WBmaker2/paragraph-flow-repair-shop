import { useState } from "react";
import UpdateHistoryDialog from "./UpdateHistoryDialog";

/** 모든 단계에서 열 수 있는 작은 헤더 버튼. 닫으면 호출 버튼으로 초점이 돌아간다(§10). */
export default function UpdateHistoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="action-button action-button--ghost app-header__history"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        업데이트 내역
      </button>
      <UpdateHistoryDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
