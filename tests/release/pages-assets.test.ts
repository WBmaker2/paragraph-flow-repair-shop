import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const BASE = "/paragraph-flow-repair-shop/";
const dist = join(process.cwd(), "dist");

function readIndexHtml(): string {
  return readFileSync(join(dist, "index.html"), "utf8");
}

describe("GitHub Pages 빌드 자산", () => {
  it("dist/index.html이 base 경로의 자산만 참조한다", () => {
    const html = readIndexHtml();
    expect(html).toContain(`${BASE}assets/`);
    expect(html).toContain(`${BASE}favicon.svg`);
    expect(html).not.toMatch(/(href|src)="\/assets\//);
    expect(html).not.toMatch(/(href|src)="\/src\//);
  });

  it("참조된 모든 자산 파일이 존재한다(동일 출처 제공)", () => {
    const html = readIndexHtml();
    const refs = [
      ...html.matchAll(/(?:href|src)="(\/paragraph-flow-repair-shop\/[^"]+)"/g),
    ].map((m) => m[1]!);
    expect(refs.length).toBeGreaterThanOrEqual(3);
    for (const ref of refs) {
      const relative = ref.slice(BASE.length).split("?")[0]!;
      expect(existsSync(join(dist, relative)), `${ref} 파일 없음`).toBe(true);
    }
  });

  it("해시가 붙은 자산과 배경 이미지가 생성된다", () => {
    const assets = readdirSync(join(dist, "assets"));
    expect(assets.some((f) => f.endsWith(".js"))).toBe(true);
    expect(assets.some((f) => f.endsWith(".css"))).toBe(true);
    expect(assets.some((f) => f.endsWith(".webp"))).toBe(true);
  });

  it("index.html에 학생 식별 요소가 없다", () => {
    const html = readIndexHtml();
    expect(html).not.toMatch(/이름|학번|생년월일/);
    expect(html).toContain("문단 흐름 수리소");
  });
});
