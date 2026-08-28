// 배포 URL 검증기(계획 문서 §12 Task 9). 실행:
// node scripts/verify-deployment.mjs [https://wbmaker2.github.io/paragraph-flow-repair-shop/]
import { chromium } from "playwright";

const BASE = (process.argv[2] ?? "https://wbmaker2.github.io/paragraph-flow-repair-shop/").replace(
  /\/?$/,
  "/",
);
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();

const failedResponses = [];
const consoleErrors = [];
page.on("response", (r) => {
  if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`);
});
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(e.message));

await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(BASE, { waitUntil: "networkidle" });

// 1) 제목
const title = await page.title();
check("페이지 제목", title.includes("문단 흐름 수리소"), title);

// 2) favicon
const faviconOk = await page.evaluate(async () => {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return false;
  const res = await fetch(link.href);
  return res.ok;
});
check("favicon 로드", faviconOk);

// 3) 참조 자산·콘솔 오류
check("404 자산 없음", failedResponses.length === 0, failedResponses.join(", "));
check("콘솔 오류 0건", consoleErrors.length === 0, consoleErrors.join(" | "));

// 4) 실제 학습 흐름 — 1번 미션 완주
await page.getByRole("button", { name: "활동 시작하기" }).click();
await page.getByRole("button", { name: "고쳐야 할 것 같아요" }).click();
await page.getByRole("button", { name: "다음", exact: true }).click();
await page.getByRole("button", { name: "우리 반은 화단에 씨앗을 심었습니다." }).click();
await page.getByRole("button", { name: "고르기 완료" }).click();
await page.getByRole("button", { name: "다음 단계로" }).click();

const gardenOrder = ["G1", "G2", "G3", "G4", "G5", "GX"];
const texts = {
  G1: "우리 반은 화단에 씨앗을 심었습니다.",
  G2: "먼저 흙을 고르게 다듬었습니다.",
  G3: "작은 구멍마다 씨앗을 넣었습니다.",
  G4: "씨앗 사이에 이름표도 꽂았습니다.",
  G5: "마지막으로 흙을 덮고 물을 주었습니다.",
  GX: "오늘 급식에는 국수가 나왔습니다.",
};
for (const [index, id] of gardenOrder.entries()) {
  await page.getByLabel(`${texts[id]} 위치 번호`).fill(String(index + 1));
}
await page.getByRole("button", { name: "문단 시험하기" }).click();
check(
  "유효 순서 통과(문단이 자연스럽게 이어져요!)",
  await page.getByText("문단이 자연스럽게 이어져요!").isVisible(),
);
await page.getByRole("button", { name: "다음 단계로" }).click();
await page
  .getByRole("button", { name: "오늘 급식에는 국수가 나왔습니다. 보관함으로 옮기기" })
  .click();
await page.getByRole("button", { name: "관련성 점검 완료" }).click();
await page.getByRole("button", { name: "다음 단계로" }).click();
await page.getByRole("button", { name: "먼저", exact: true }).click();
await page.getByRole("button", { name: "선택 완료" }).click();
await page.getByRole("button", { name: "다음 단계로" }).click();
await page.getByRole("button", { name: "시간 순서" }).click();
await page.getByRole("button", { name: "수리 완료 확인" }).click();
check(
  "1번 미션 완주 후 2번 미션 진입",
  await page.getByRole("heading", { name: /2번 미션/ }).isVisible(),
);

// 5) 375px 화면
await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(300);
const { scrollWidth, clientWidth } = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
check("375px 가로 스크롤 없음", scrollWidth <= clientWidth, `${scrollWidth} <= ${clientWidth}`);
check("375px 콘솔 오류 0건(누적)", consoleErrors.length === 0, consoleErrors.join(" | "));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`);
process.exit(failed.length === 0 ? 0 : 1);
