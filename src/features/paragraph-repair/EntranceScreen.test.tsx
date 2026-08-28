import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import EntranceScreen from "./EntranceScreen";
import { missionTitles, missions } from "../../content/missions";

describe("입구 화면", () => {
  it("학습 목표, 6개 미션, 예상 시간, 저장 안내를 보여 준다", () => {
    render(<EntranceScreen onStart={() => {}} />);
    expect(
      screen.getByLabelText("학습 목표"),
    ).toHaveTextContent(/문단은 문장이 모인 것이 아니라, 중심 생각으로 이어진 글이에요/);
    for (const mission of missions) {
      expect(screen.getByText(missionTitles[mission.id])).toBeInTheDocument();
    }
    expect(screen.getByText(/15~25분/)).toBeInTheDocument();
    expect(screen.getByText(/새로고침하면 사라져요/)).toBeInTheDocument();
  });

  it("시작 버튼을 누르면 onStart가 호출된다", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<EntranceScreen onStart={onStart} />);
    await user.click(screen.getByRole("button", { name: "활동 시작하기" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("시작 버튼은 Enter와 Space로도 동작한다", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<EntranceScreen onStart={onStart} />);
    const start = screen.getByRole("button", { name: "활동 시작하기" });
    start.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it("업데이트 내역 대화상자를 열고 닫을 수 있다", async () => {
    const user = userEvent.setup();
    render(<EntranceScreen onStart={() => {}} />);
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    const dialog = screen.getByRole("dialog", { name: "업데이트 내역" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/구현 계획 확정/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("dialog", { name: "업데이트 내역" })).not.toBeInTheDocument();
  });
});
