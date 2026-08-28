import { defineConfig } from "vitest/config";

/** dist 자산 검증 전용 설정. npm run build 뒤 `npm run test:release`로 실행한다. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/release/**/*.test.ts"],
  },
});
