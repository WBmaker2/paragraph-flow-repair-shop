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
  {
    file: "src/assets/generated/repair-desk-atmosphere-v2.webp",
    usage: "교정지 여백 작업대 배경(장식 전용, 글자·정답 없음)",
    createdDate: "2026-08-30",
  },
  {
    file: "src/assets/generated/mission-scenes-atlas-v2.webp",
    usage: "6개 미션 장면 아틀라스(장식 전용, 글자·정답 없음)",
    createdDate: "2026-08-30",
  },
  {
    file: "src/assets/generated/repair-tools-v2.webp",
    usage: "수리 도구 장면(장식 전용, 글자·정답 없음)",
    createdDate: "2026-08-30",
  },
];
