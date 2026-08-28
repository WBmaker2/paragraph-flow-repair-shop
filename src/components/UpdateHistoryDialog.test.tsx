import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import UpdateHistoryDialog from "./UpdateHistoryDialog";

function setup() {
  const onClose = vi.fn();
  render(
    <>
      <button type="button" id="opener">
        업데이트 내역
      </button>
      <UpdateHistoryDialog open onClose={onClose} />
    </>,
  );
  return { onClose };
}

describe("업데이트 내역 대화상자", () => {
  it("날짜와 함께 바뀐 일을 보여 준다", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
    expect(screen.getByText(/2026-08-28/)).toBeInTheDocument();
    expect(screen.getByText(/구현 계획 확정/)).toBeInTheDocument();
  });

  it("닫기 버튼으로 닫을 수 있다", async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape로 닫고 호출 버튼으로 초점을 돌려준다", async () => {
    const user = userEvent.setup();
    const { onClose } = setup();
    const opener = screen.getByRole("button", { name: "업데이트 내역" });
    opener.focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(opener).toHaveFocus();
  });

  it("열리면 초점이 대화상자 안에 머문다", () => {
    setup();
    const dialog = screen.getByRole("dialog", { name: "업데이트 내역" });
    const active = document.activeElement;
    expect(dialog).toContainElement(active as HTMLElement);
  });
});
