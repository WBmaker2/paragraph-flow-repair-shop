import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generatedAssets } from "./assetManifest";

const root = process.cwd();
const ledger = readFileSync(join(root, "docs/image-rights-ledger.md"), "utf8");

describe("생성 자산 장부 계약", () => {
  it("장부의 모든 자산 파일이 실제로 존재하고 충분한 크기를 가진다", () => {
    for (const asset of generatedAssets) {
      const full = join(root, asset.file);
      expect(existsSync(full), `${asset.file} 파일 없음`).toBe(true);
      expect(statSync(full).size).toBeGreaterThan(1_000);
    }
  });

  it("생성된 자산 안에 글자를 담지 않는다(파일 형식 계약)", () => {
    for (const asset of generatedAssets) {
      expect(asset.file).toMatch(/\.webp$/);
      expect(asset.usage.length).toBeGreaterThanOrEqual(4);
      expect(asset.createdDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("자산 장부(docs/image-rights-ledger.md)와 1:1로 대응한다", () => {
    for (const asset of generatedAssets) {
      expect(ledger).toContain(asset.file);
    }
    const listed = ledger.match(/src\/assets\/generated\/[\w.-]+/g) ?? [];
    expect(new Set(listed).size).toBe(generatedAssets.length);
  });

  it("장부는 생성 프롬프트와 사람 검수 대기 상태를 기록한다", () => {
    expect(ledger).toContain("생성 프롬프트");
    expect(ledger).toContain("대기(pending)");
    expect(ledger).toContain("글자");
  });

  it("앱에서 자산을 실제로 사용한다(장식용 배경)", () => {
    const app = readFileSync(join(root, "src/app/App.tsx"), "utf8");
    expect(app).toContain("paper-repair-workbench");
  });
});
