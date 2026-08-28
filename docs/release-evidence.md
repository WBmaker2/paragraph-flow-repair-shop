# 출시 증거 (Release Evidence)

## 배포 정보

| 항목 | 내용 |
|---|---|
| 배포 URL | https://wbmaker2.github.io/paragraph-flow-repair-shop/ |
| 저장소 | https://github.com/WBmaker2/paragraph-flow-repair-shop (main, public) |
| Pages 방식 | build_type=workflow (`deploy-pages.yml`, base `/paragraph-flow-repair-shop/`) |
| 출시 승인 | 2026-08-28 사용자 승인 ("승인") |
| 최초 배포 | 2026-08-28, run https://github.com/WBmaker2/paragraph-flow-repair-shop/actions/runs/33176637242 (성공) |

## 배포 URL 라이브 검증 (scripts/verify-deployment.mjs, 8/8 통과)

- ✓ 페이지 제목 — 문단 흐름 수리소
- ✓ favicon 로드
- ✓ 404 자산 없음(HTML 참조 자산 전부 로드)
- ✓ 콘솔 오류 0건
- ✓ 유효 순서 통과(문단이 자연스럽게 이어져요!) — 1번 미션 실제 학습 흐름
- ✓ 1번 미션 완주 후 2번 미션 진입
- ✓ 375px 가로 스크롤 없음 (375 <= 375)
- ✓ 375px 콘솔 오류 0건(누적)

## CI 상태

- 최초 push CI: 실패 → 원인은 CI 머신에서 드라이브 기반 테스트(a11y 전 단계 스윕)가
  vitest 기본 5초 타임아웃을 초과한 것. 해당 테스트에 60초 타임아웃을 명시해 수정.
- 수정 커밋 push 뒤 CI 재실행 결과로 최종 판정한다(아래 표에 기록).

| 실행 | 워크플로 | 결과 |
|---|---|---|
| 2026-08-28 | Deploy to GitHub Pages (33176637242) | success |
| 2026-08-28 | CI (최초 push, 33176623027) | failure(타임아웃) → 타임아웃 수정 후 재검증 |

## 로컬 검증 (2026-08-28, npm run verify 전체 통과)

- lint·typecheck 오류 0건
- 단위·컴포넌트 108테스트 통과, a11y serious/critical 0건
- E2E 9개 시나리오 통과(두 유효 순서·인과 뒤집기·보관함 잠금·키보드·보고서·320/375px·축소 모션)
- 개인정보·네트워크 경계: 외부 요청·저장 쓰기 0건
- dist 자산·base 경로·식별자 없음 검증 통과

## 남은 별도 단계

- HVC 관리자 등록과 정적 갤러리 동기화(공개 앱 확인 뒤 별도 단계) — 확인 링크: https://www.vibehong.shop/
- 사람 검수(교과 정확성·문장 난이도·생성 이미지)는 `docs/content-review.md`, `docs/image-rights-ledger.md` 참조
