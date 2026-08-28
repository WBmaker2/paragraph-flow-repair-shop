import { expect, type Page } from "@playwright/test";
import { missions, relationLabels } from "../src/content/missions";
import type { ParagraphMission } from "../src/domain/types";

export function sentenceText(mission: ParagraphMission, id: string): string {
  return mission.sentences.find((s) => s.id === id)!.text;
}

export async function start(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "활동 시작하기" }).click();
}

export async function driveToOrder(page: Page, mission: ParagraphMission) {
  await page.getByRole("button", { name: "고쳐야 할 것 같아요" }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page
    .getByRole("button", { name: sentenceText(mission, mission.topicSentenceIds[0]!) })
    .click();
  await page.getByRole("button", { name: "고르기 완료" }).click();
  await page.getByRole("button", { name: "다음 단계로" }).click();
}

/**
 * 한 미션을 처음부터 끝까지 완주한다.
 * - orderIds를 주면 위치 번호 입력으로 해당 순서를 만들고 한 번 시험한다(통과 경로).
 * - 주지 않으면 초기 순서로 두 번 시험해 판단 보류 경로를 통과한다.
 */
export async function completeMission(
  page: Page,
  missionIndex: number,
  opts: { orderIds?: readonly string[] } = {},
) {
  const mission = missions[missionIndex]!;
  await driveToOrder(page, mission);

  if (opts.orderIds) {
    for (const [index, id] of opts.orderIds.entries()) {
      await page
        .getByLabel(`${sentenceText(mission, id)} 위치 번호`)
        .fill(String(index + 1));
    }
    await page.getByRole("button", { name: "문단 시험하기" }).click();
    await expect(page.getByText("문단이 자연스럽게 이어져요!")).toBeVisible();
  } else {
    await page.getByRole("button", { name: "문단 시험하기" }).click();
    await page.getByRole("button", { name: "문단 시험하기" }).click();
    await expect(page.getByText("함께 다시 볼 근거예요")).toBeVisible();
  }
  await page.getByRole("button", { name: "다음 단계로" }).click();

  if (mission.offTopicSentenceIds.length > 0) {
    await page
      .getByRole("button", {
        name: `${sentenceText(mission, mission.offTopicSentenceIds[0]!)} 보관함으로 옮기기`,
      })
      .click();
  } else {
    await page.getByRole("button", { name: "벗어난 문장이 없어요" }).click();
  }
  await page.getByRole("button", { name: "관련성 점검 완료" }).click();
  await page.getByRole("button", { name: "다음 단계로" }).click();

  const connector = mission.connectorOptions.find((o) => o.relations.includes(mission.relation))!;
  await page.getByRole("button", { name: connector.text, exact: true }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await page.getByRole("button", { name: "다음 단계로" }).click();

  await page.getByRole("button", { name: relationLabels[mission.relation] }).click();
  await page.getByRole("button", { name: "수리 완료 확인" }).click();
}
