import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { beforeAll, describe, expect, it, vi } from "vitest";
import App from "../../src/app/App";
import { driveSession } from "../helpers/driveSession";
import type { AxeResults } from "axe-core";

// jsdom에는 canvas 2D 컨텍스트와 의사 요소 getComputedStyle이 없다. axe 최소 스텁으로 대체한다.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    measureText: () => ({ width: 0 }),
    font: "",
  } as unknown as CanvasRenderingContext2D);

  const original = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((elt, pseudo?: string | null) => {
    if (pseudo) {
      // 렌더링되지 않는 의사 요소로 취급해 축소 모션 배지 등을 건너뛰게 한다.
      return {
        content: "none",
        display: "none",
        width: "0px",
        height: "0px",
        position: "static",
      } as unknown as CSSStyleDeclaration;
    }
    return original(elt);
  });
});

const violationsOf = (results: AxeResults) =>
  results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

describe("자동 접근성 검사(vitest-axe)", () => {
  it("입구와 학습 단계, 보고서, 대화상자에서 serious/critical 위반이 0건이다", { timeout: 60_000 }, async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    const problems: string[] = [];

    problems.push(...violationsOf(await axe(container)).map((v) => `entrance: ${v.id}`));

    await driveSession(user, {
      onStep: async (_step, missionIndex) => {
        const results = await axe(screen.getByRole("main"));
        for (const v of violationsOf(results)) {
          problems.push(`mission${missionIndex + 1}: ${v.id}`);
        }
      },
    });

    // 업데이트 내역 대화상자
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    problems.push(...violationsOf(await axe(screen.getByRole("dialog"))).map((v) => `dialog: ${v.id}`));
    await user.keyboard("{Escape}");

    expect(problems).toEqual([]);
  });

  it("모든 미션의 화면이 렌더링 도중 한 번씩 검사된다", { timeout: 60_000 }, async () => {
    const user = userEvent.setup();
    render(<App />);
    const checked = await driveSession(user, {});
    // 6 미션 × 6 단계 + 보고서
    expect(checked.length).toBeGreaterThanOrEqual(37);
  });
});

export {};
