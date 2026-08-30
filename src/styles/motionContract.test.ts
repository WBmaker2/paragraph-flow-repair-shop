import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const motionCss = readFileSync(join(root, "src/styles/motion.css"), "utf8");

/** gi-pulse 클래스 조립과 핵심 행동 pulse 지정은 계약 대상 파일로 한정한다. */
const CLASS_COMPOSER = "src/components/ActionButton.tsx";
const PULSE_ALLOWED = new Set([
  "src/components/ActionButton.tsx",
  "src/features/paragraph-repair/EntranceScreen.tsx",
  "src/features/paragraph-repair/steps/ReadStep.tsx",
  "src/features/paragraph-repair/steps/TopicStep.tsx",
  "src/features/paragraph-repair/steps/OrderStep.tsx",
  "src/features/paragraph-repair/steps/RelevanceStep.tsx",
  "src/features/paragraph-repair/steps/ConnectorStep.tsx",
  "src/features/paragraph-repair/steps/ExplainStep.tsx",
]);

function walk(dir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...walk(full, exts));
    } else if (exts.some((ext) => name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

describe("모션 CSS 계약", () => {
  it("gi-pulse 클래스는 ActionButton에서만 조립되고 단계별 핵심 행동에만 켠다", () => {
    const tsxFiles = walk(join(root, "src"), [".tsx"]);
    const sourceTsxFiles = tsxFiles.filter((file) => !file.endsWith(".test.tsx"));
    const withClass = sourceTsxFiles.filter((file) => readFileSync(file, "utf8").includes("gi-pulse"));
    expect(withClass.map((f) => f.slice(root.length + 1))).toEqual([CLASS_COMPOSER]);

    const withPulse = sourceTsxFiles.filter((file) => /\bpulse\b/.test(readFileSync(file, "utf8")));
    expect(new Set(withPulse.map((f) => f.slice(root.length + 1)))).toEqual(PULSE_ALLOWED);
  });

  it("축소 모션에서 맥박이 제거되고 3px 외곽선과 필수 배지로 대체된다", () => {
    const css = motionCss.replace(/\s+/g, " ");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    const reduceBlock = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    expect(reduceBlock).toContain(".gi-pulse { animation: none;");
    expect(reduceBlock).toContain("outline: 3px solid");
    expect(reduceBlock).toContain('content: "필수"');
  });

  it("문장 카드의 이동 애니메이션이 축소 모션에서 제거된다", () => {
    const css = motionCss.replace(/\s+/g, " ");
    expect(css).toContain(".sentence-card");
    const reduceBlock = css.split("@media (prefers-reduced-motion: reduce)")[1] ?? "";
    expect(reduceBlock).toContain("transition: none");
  });
});
