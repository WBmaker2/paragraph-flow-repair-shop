import { expect, test } from "@playwright/test";
import { completeMission, driveToOrder, start } from "./helpers";
import { missions } from "../src/content/missions";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe("320px 화면", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("모든 학습 단계에서 가로 스크롤이 생기지 않는다", async ({ page }) => {
    await start(page);
    await expectNoHorizontalOverflow(page);

    for (let i = 0; i < missions.length; i += 1) {
      await completeMission(page, i, i === 0 ? { orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"] } : {});
      await expectNoHorizontalOverflow(page);
    }

    await expect(page.getByRole("heading", { level: 1, name: "수리 기록" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("375px 화면", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("순서 수리 화면에서 가로 스크롤이 생기지 않는다", async ({ page }) => {
    await start(page);
    await driveToOrder(page, missions[0]!);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("축소 모션", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("gi-pulse 맥박과 문장 이동 애니메이션이 제거되고 필수 배지로 대체된다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await start(page);
    await driveToOrder(page, missions[0]!);

    const testButton = page.getByRole("button", { name: "문단 시험하기" });
    const animationName = await testButton.evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");

    const badge = await testButton.evaluate((el) => getComputedStyle(el, "::after").content);
    expect(badge).toContain("필수");

    const card = page.locator(".sentence-card").first();
    const transitionDuration = await card.evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(transitionDuration).toBe("0s");
  });
});
