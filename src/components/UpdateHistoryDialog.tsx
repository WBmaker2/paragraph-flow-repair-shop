import ModalDialog from "./ModalDialog";
import { updateHistory } from "../update/updateHistory";

interface UpdateHistoryDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export default function UpdateHistoryDialog({ open, onClose }: UpdateHistoryDialogProps) {
  return (
    <ModalDialog open={open} onClose={onClose} title="업데이트 내역">
      <p className="dialog__note">이 앱에서 바뀐 일을 날짜와 함께 기록해요.</p>
      <ul className="update-list">
        {updateHistory.map((entry) => (
          <li key={`${entry.date}-${entry.summary}`} className="update-list__item">
            <strong>{entry.date}</strong> — {entry.summary}
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}
