/** print.css가 보장해야 할 최소 규칙(A4 세로, 흰 배경·검정 텍스트, 제어 숨김). */
export const printCssRules = {
  summary: "A4 세로, 흰 배경·검정 텍스트, 제어 버튼 숨김을 보장한다",
  required: [
    "@media print {",
    "@page { size: A4 portrait;",
    "background: #ffffff",
    "color: #000000",
    ".app-header",
    "display: none",
    "break-inside: avoid",
  ],
} as const;
