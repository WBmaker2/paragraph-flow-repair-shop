// 문단 흐름 수리소 작업대 배경 자산 생성기(로컬 합성, 이미지 생성 모델 프롬프트는
// docs/image-rights-ledger.md에 기록). 실행: node scripts/generate-workbench-asset.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "src/assets/generated/paper-repair-workbench.webp");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const dataUrl = await page.evaluate(() => {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");

  // 밝은 종이 바탕
  ctx.fillStyle = "#fdf8ef";
  ctx.fillRect(0, 0, 1600, 900);

  // 은은한 종이 결 (가는 대각선)
  ctx.strokeStyle = "rgba(216, 201, 172, 0.25)";
  ctx.lineWidth = 1;
  for (let x = -900; x < 1600; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 900, 900);
    ctx.stroke();
  }

  // 흩어진 문장 띠 카드 (장식, 글자 없음)
  const cards = [
    [120, 130, 300, 54, "#ffffff", "#d8c9ac"],
    [520, 90, 260, 48, "#ffffff", "#c9d8ea"],
    [980, 160, 320, 56, "#ffffff", "#d8c9ac"],
    [240, 420, 340, 56, "#ffffff", "#c9d8ea"],
    [760, 390, 280, 50, "#ffffff", "#d8c9ac"],
    [1180, 470, 300, 54, "#ffffff", "#d8c9ac"],
    [420, 700, 300, 54, "#ffffff", "#d8c9ac"],
    [900, 660, 340, 56, "#ffffff", "#c9d8ea"],
    [1350, 740, 220, 48, "#ffffff", "#d8c9ac"],
  ];
  for (const [x, y, w, h, fill, stroke] of cards) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();
  }

  // 연결 화살표 표식
  ctx.strokeStyle = "rgba(59, 110, 165, 0.30)";
  ctx.fillStyle = "rgba(59, 110, 165, 0.30)";
  ctx.lineWidth = 3;
  const arrows = [
    [300, 260, 520, 240],
    [700, 270, 900, 250],
    [1140, 300, 1300, 380],
    [420, 520, 600, 560],
    [860, 540, 1060, 560],
    [560, 780, 780, 760],
  ];
  for (const [x1, y1, x2, y2] of arrows) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL("image/webp", 0.85);
});

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, Buffer.from(dataUrl.split(",")[1], "base64"));
await browser.close();
console.log(`generated: ${target}`);
