import { expect, test } from "@playwright/test";
import { completeMission, driveToOrder, sentenceText, start } from "./helpers";
import { missions } from "../src/content/missions";

const garden = missions[0]!;
const rain = missions.find((m) => m.id === "paragraph-rain-02")!;

test("시간 순서 미션을 유효한 첫 번째 순서로 완료한다", async ({ page }) => {
  await start(page);
  await driveToOrder(page, garden);
  for (const [index, id] of ["G1", "G2", "G3", "G4", "G5", "GX"].entries()) {
    await page.getByLabel(`${sentenceText(garden, id)} 위치 번호`).fill(String(index + 1));
  }
  await page.getByRole("button", { name: "문단 시험하기" }).click();
  await expect(page.getByText("문단이 자연스럽게 이어져요!")).toBeVisible();
});

test("허용된 대안 순서(G1-G2-G4-G3-G5)도 오답으로 표시되지 않는다", async ({ page }) => {
  await start(page);
  await driveToOrder(page, garden);
  for (const [index, id] of ["G1", "G2", "G4", "G3", "G5", "GX"].entries()) {
    await page.getByLabel(`${sentenceText(garden, id)} 위치 번호`).fill(String(index + 1));
  }
  await page.getByRole("button", { name: "문단 시험하기" }).click();
  await expect(page.getByText("문단이 자연스럽게 이어져요!")).toBeVisible();
});

test("원인과 결과를 뒤집으면 관계 근거 피드백을 보여 준다", async ({ page }) => {
  await start(page);
  await completeMission(page, 0, { orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"] });

  await driveToOrder(page, rain);
  for (const [index, id] of ["R1", "R3", "R2", "R4", "RX"].entries()) {
    await page.getByLabel(`${sentenceText(rain, id)} 위치 번호`).fill(String(index + 1));
  }
  await page.getByRole("button", { name: "문단 시험하기" }).click();

  const panel = page.getByRole("status");
  await expect(panel).toContainText("원인과 결과가 뒤집혀요");
  await expect(panel).not.toContainText("R1-R2-R3-R4");
});

test("관련 없는 문장을 옮기기 전에는 완료 버튼이 잠긴다", async ({ page }) => {
  await start(page);
  await driveToOrder(page, garden);
  await page.getByRole("button", { name: "문단 시험하기" }).click();
  await page.getByRole("button", { name: "문단 시험하기" }).click();
  await page.getByRole("button", { name: "다음 단계로" }).click();

  await expect(page.getByRole("button", { name: "관련성 점검 완료" })).toBeDisabled();
  await page
    .getByRole("button", { name: `${sentenceText(garden, "GX")} 보관함으로 옮기기` })
    .click();
  await expect(page.getByRole("button", { name: "관련성 점검 완료" })).toBeEnabled();
});

test("6개 문단을 수리하면 보고서에서 최초·최종 순서를 비교한다", async ({ page }) => {
  await start(page);
  for (let i = 0; i < missions.length; i += 1) {
    await completeMission(page, i, i === 0 ? { orderIds: ["G1", "G2", "G3", "G4", "G5", "GX"] } : {});
  }

  await expect(page.getByRole("heading", { level: 1, name: "수리 기록" })).toBeVisible();
  await expect(page.locator(".report-mission")).toHaveCount(6);

  await expect(page.getByLabel("1번 미션 처음 순서")).toContainText(
    "작은 구멍마다 씨앗을 넣었습니다.",
  );
  await expect(page.getByLabel("1번 미션 최종 순서")).toContainText("먼저 흙을 고르게 다듬었습니다.");
  await expect(page.getByLabel("2번 미션 처음 순서")).toContainText("운동장 바닥이 젖었습니다.");
});
