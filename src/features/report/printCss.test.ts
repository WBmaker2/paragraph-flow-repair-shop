import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { printCssRules } from "./printCssContract";

const css = readFileSync(join(process.cwd(), "src/features/report/print.css"), "utf8");

describe("인쇄 CSS 계약", () => {
  it(printCssRules.summary, () => {
    for (const fragment of printCssRules.required) {
      expect(css.replace(/\s+/g, " ")).toContain(fragment);
    }
  });
});
