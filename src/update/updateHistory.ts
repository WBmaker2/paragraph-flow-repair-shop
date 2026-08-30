export interface UpdateEntry {
  readonly date: string;
  readonly summary: string;
}

/** 실제 수정 때마다 최신 날짜를 앞에 추가한다(계획 문서 §10). */
export const updateHistory: readonly UpdateEntry[] = [
  { date: "2026-08-30", summary: "6개 미션 장면과 수리 도구 이미지를 작업대 화면에 추가" },
  { date: "2026-08-30", summary: "축소 모션에서도 다음 버튼의 접근성 이름 유지" },
  { date: "2026-08-30", summary: "교정지 여백 작업대 리디자인과 단계별 핵심 행동 강조" },
  { date: "2026-08-28", summary: "구현 계획 확정" },
];
