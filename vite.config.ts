import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발(dev 서버)은 /, 빌드와 preview(GitHub Pages 하위 경로)는 /paragraph-flow-repair-shop/ (계획 §12 Task 0).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "development" ? "/" : "/paragraph-flow-repair-shop/",
  build: {
    sourcemap: false,
  },
}));
