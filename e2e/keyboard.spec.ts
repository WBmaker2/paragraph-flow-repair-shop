import { expect, test } from "@playwright/test";
import { sentenceText, start } from "./helpers";
import { missions } from "../src/content/missions";

const garden = missions[0]!;

test("키보드만으로 문장 순서를 바꾸고 포커스가 이동한 문장에 남는다", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "고쳐야 할 것 같아요" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "다음", exact: true }).focus();
  await page.keyboard.press("Enter");

  const topicButton = page.getByRole("button", { name: sentenceText(garden, "G1") });
  await topicButton.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "고르기 완료" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "다음 단계로" }).focus();
  await page.keyboard.press("Enter");

  // G3을 한 칸 위로 이동 (초기 순서 [G1, G3, G2, GX, G5, G4])
  const moveG3Up = page.getByRole("button", {
    name: `${sentenceText(garden, "G3")} 위로 이동`,
  });
  await moveG3Up.focus();
  await page.keyboard.press("Enter");

  // 이동 버튼은 가장자리에서 비활성화하지 않으므로 초점이 이동한 문장에 남는다.
  await expect(moveG3Up).toBeFocused();

  // 위치 번호가 1로 바뀌었는지 확인한다.
  const position = page.getByLabel(`${sentenceText(garden, "G3")} 위치 번호`);
  await expect(position).toHaveValue("1");
});
