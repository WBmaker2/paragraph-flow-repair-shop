#!/usr/bin/env node
// TS, TSX, CSS 파일 500줄 미만 규칙 검사기 (계획 문서 §8).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MAX_LINES = 500;
const TARGET_EXT = new Set([".ts", ".tsx", ".css"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "coverage", "playwright-report", "test-results"]);

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (TARGET_EXT.has(full.slice(full.lastIndexOf(".")))) {
      const lines = readFileSync(full, "utf8").split("\n").length;
      if (lines >= MAX_LINES) {
        violations.push({ file: relative(ROOT, full), lines });
      }
    }
  }
}

for (const dir of ["src", "tests", "e2e"]) {
  try {
    walk(join(ROOT, dir));
  } catch {
    // 아직 디렉터리가 없으면 건너뛴다.
  }
}

if (violations.length > 0) {
  console.error("500줄 이상인 파일이 있습니다:");
  for (const { file, lines } of violations) {
    console.error(`  ${file}: ${lines}줄`);
  }
  process.exit(1);
}

console.log("모든 TS·TSX·CSS 파일이 500줄 미만입니다.");
