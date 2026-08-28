export interface UpdateEntry {
  readonly date: string;
  readonly summary: string;
}

/** 실제 수정 때마다 최신 날짜를 앞에 추가한다(계획 문서 §10). */
export const updateHistory: readonly UpdateEntry[] = [
  { date: "2026-08-28", summary: "구현 계획 확정" },
];
