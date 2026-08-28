import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App 셸", () => {
  it("처음에는 입구 화면을 보여 준다", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: "문단 흐름 수리소" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "활동 시작하기" })).toBeInTheDocument();
  });

  it("시작하면 첫 미션 화면으로 바뀌고 제목에 초점이 옮겨진다", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "활동 시작하기" }));
    const heading = screen.getByRole("heading", { level: 1, name: /1번 미션/ });
    expect(heading).toHaveFocus();
  });

  it("헤더의 업데이트 내역은 학습 화면에서도 열 수 있다", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "활동 시작하기" }));
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
  });

  it("글자 크기 도구는 세션 안에서만 동작한다", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "글자 크게" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("text-large")).toBe(true);
    await user.click(toggle);
    expect(document.documentElement.classList.contains("text-large")).toBe(false);
  });
});
