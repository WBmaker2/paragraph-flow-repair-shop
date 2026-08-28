# 문단 흐름 수리소 (Paragraph Flow Repair Shop)

초등 3~6학년 국어 학습용 정적 웹 앱. 학생은 문단의 중심 문장을 찾고, 문장 순서를 수리하고,
관련 없는 문장을 보관함으로 옮기고, 이어 주는 말을 고르며, 자신의 수리를 근거로 설명합니다.

- **대상:** 초등 3~6학년 / **교과:** 국어 / **권장 활동 시간:** 15~25분
- **미션:** 검수 대기 상태의 고정 미션 6개(런타임 무작위 생성 없음)
- **개인정보:** 서버·로그인·localStorage·sessionStorage·쿠키·외부 요청 없음. 응답은 현재 탭 메모리에만 존재하며 새로고침하면 사라집니다.
- **검수 상태:** 모든 미션 문장과 정답은 `reviewStatus: "pending"` — 국어 교사 검수 전까지 출시하지 않습니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버 (base /)
npm run build      # 프로덕션 빌드 (base /paragraph-flow-repair-shop/)
npm run verify     # lint → typecheck → 단위/a11y 테스트 → 줄 수 검사 → build → 릴리스 자산 테스트 → E2E
```

## 스크립트

| 스크립트 | 역할 |
|---|---|
| `npm run lint` | ESLint 오류 0건 |
| `npm run typecheck` | TypeScript strict 오류 0건 |
| `npm run test:run` | 단위·컴포넌트·개인정보 경계 테스트 |
| `npm run test:a11y` | vitest-axe serious/critical 위반 0건 |
| `npm run check:lines` | TS·TSX·CSS 파일 500줄 미만 검사 |
| `npm run build` | `/paragraph-flow-repair-shop/` base로 dist 생성 |
| `npm run test:release` | dist 자산과 Pages base 검증 (build 뒤 실행) |
| `npm run test:e2e` | Playwright 학습 흐름·키보드·모바일/축소 모션 |
| `npm run verify` | 위 전부 |

## 계획 문서 대조 (Task 0)

이 저장소 루트의 `2026-08-28-paragraph-flow-repair-shop-implementation-plan.md`는
원본(`vibecoding-lab/docs/superpowers/plans/` 동일 파일명)과 SHA-256이 일치함을 확인했습니다.

- SHA-256: `dc48b632b040e91aefc31b2d2118786cce7da94f2cbbe61dc859a5e33b03a4d1`

## 한계

이 앱은 교육 모형입니다. 판정은 검수된 고정 미션에만 적용되며 실제 세계 전체의 문단 판단을
보장하지 않습니다. 교과 정확성과 어린이 문장 난이도는 사람 검수가 필요합니다( `docs/content-review.md` ).
VoiceOver 수동 검증과 학생용 음성 안내는 범위에서 제외했습니다.
