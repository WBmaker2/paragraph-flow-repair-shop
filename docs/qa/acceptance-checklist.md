# 수용 기준 점검표 (QA)

> 자동 검증은 `npm run verify` 한 번으로 재현할 수 있다. 아래 체크는 2026-08-28 구현 시점 기준이며,
> 사람 검수 항목은 교사 검수·출시 승인 전까지 완료로 표시하지 않는다.

## 자동으로 증명

- [x] `npm run lint` — 오류 0건
- [x] `npm run typecheck` — strict 오류 0건
- [x] `npm run test:run` — 단위·컴포넌트 108테스트 통과 (6개 미션 fixture·복수 해법·판정 계약 포함)
- [x] `npm run test:a11y` — vitest-axe serious/critical 위반 0건 (입구·전 단계·보고서·대화상자)
- [x] `npm run check:lines` — TS·TSX·CSS 500줄 이상 0개
- [x] `npm run build` — base `/paragraph-flow-repair-shop/` 해시 자산 생성
- [x] `npm run test:release` — dist 자산·base 경로·식별자 없음 검증
- [x] `npm run test:e2e` — 아래 시나리오 통과
  - [x] 시간 순서 안내 미션을 유효한 두 순서로 각각 완료
  - [x] 원인과 결과를 뒤집었을 때 관계 근거 피드백(정답 미공개)
  - [x] 관련 없는 문장을 옮기기 전 완료 버튼 잠김
  - [x] 키보드만으로 문장 순서 변경, 초점이 이동한 문장에 유지
  - [x] 6개 문단 뒤 보고서에서 최초·최종 순서 비교
  - [x] 320px·375px에서 가로 스크롤 없음
  - [x] 축소 모션에서 gi-pulse 제거 + 필수 배지, 문장 이동 애니메이션 제거
- [x] 외부 요청(window.fetch·XMLHttpRequest·WebSocket·EventSource·sendBeacon) 0건
- [x] localStorage·sessionStorage·IndexedDB·쿠키 쓰기 0건
- [x] gi-pulse는 문단 시험하기·수리 완료 확인 두 버튼만 (정적 계약 테스트)

## 사람 검수 필요 (출시 전)

- [ ] 국어 교사의 교과 정확성 검수(6개 미션 문장·승인 순서·근거 문구) — `docs/content-review.md`
- [ ] 어린이 문장 난이도·피드백 문구 검수
- [ ] 생성 이미지의 맥락·편향·권리 검수 — `docs/image-rights-ledger.md`
- [ ] 실제 태블릿(320~1280px) 가독성 확인

## 명시적 제외

- VoiceOver 수동 검증, 학생용 음성 안내, TTS, 음성 녹음은 범위에서 제외했다.
- 다크 모드는 제외했다(밝은 교실용 라이트 모드 고정).

## 출시 경계

- [x] 사용자 출시 승인 (2026-08-28 "승인")
- [x] push → WBmaker2/paragraph-flow-repair-shop main → Pages build_type=workflow 설정
- [x] 배포 URL 확인 — scripts/verify-deployment.mjs 8/8 통과(제목·favicon·자산·콘솔 오류 0건·실제 학습 흐름·375px)
  - 배포 URL: https://wbmaker2.github.io/paragraph-flow-repair-shop/
  - 상세 증거: docs/release-evidence.md
- [ ] HVC 관리자 등록 및 정적 갤러리 동기화(별도 단계, 확인 링크: https://www.vibehong.shop/)
