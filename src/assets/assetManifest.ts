/** 로컬 생성 자산 목록. docs/image-rights-ledger.md와 1:1 대응을 유지한다. */
export interface GeneratedAsset {
  readonly file: string;
  readonly usage: string;
  readonly createdDate: string;
}

export const generatedAssets: readonly GeneratedAsset[] = [
  {
    file: "src/assets/generated/paper-repair-workbench.webp",
    usage: "작업대 배경(장식 전용, 글자·정답 없음)",
    createdDate: "2026-08-28",
  },
];
