# 문단 흐름 수리소 전체 리디자인 실행 보고서

- **실행일:** 2026-08-30
- **대상:** `/Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop`
- **요청 범위:** 기존 교육용 React 앱의 전체 시각·상호작용 리디자인
- **현재 상태:** 소스 구현과 로컬 검증 완료. 커밋·푸시·배포·HVC 등록은 수행하지 않음.

## 결론

실제 저장소는 사용자가 표현한 Next.js가 아니라 Vite React/TypeScript 앱이므로 현재 실행 구조를 보존한 채 전체 화면을 `교정지 여백 작업대` 방향으로 리디자인했습니다. 여섯 개 미션의 고정 문장, 판정 함수, `useReducer` 상태 흐름, 재시도·유예·뒤로 가기 의미, 저장하지 않는 개인정보 경계는 바꾸지 않았습니다.

입장 화면은 학습 목적과 첫 행동을 먼저 보여 주고 실제 미션 목록을 옆에 배치했습니다. 작업 화면은 `미션 / 현재 단계 / 왜 하는지 / 지금 할 일`을 분리했으며, 보고서는 점수나 순위 없이 세션에서 남긴 판단·수리·근거를 요약합니다.

## 먼저 확인한 규칙과 계획

- 프로젝트 전용 `AGENTS.md`, `EDUCATION_DESIGN.md`, 기존 `design-system/MASTER.md`는 저장소에서 발견되지 않아 세션의 사용자 제공 규칙과 기존 제품 문서·테스트를 우선 적용했습니다.
- `education-webapp-redesign` Stage 0를 오프라인으로 실행해 `impeccable`, `ui-ux-pro-max`, `redesign-existing-projects`, `imagegen` 지원 상태를 확인했습니다. 결과는 [`education-webapp-redesign-stage0-report.md`](./education-webapp-redesign-stage0-report.md)에 보존했습니다.
- 제품 사실은 [`PRODUCT.md`](../PRODUCT.md), 초기 문제와 기준선은 [`education-webapp-redesign-audit.md`](./education-webapp-redesign-audit.md), 실행 계획은 [`education-webapp-redesign-plan.md`](./education-webapp-redesign-plan.md)에 기록했습니다.

## 구현한 변경

### 화면·상호작용

- `src/app/App.tsx`: skip link, `main#main-content`, 전역 헤더, 한 개의 업데이트 내역 버튼, 단계 전환 시 포커스와 스크롤 보정
- `src/features/paragraph-repair/EntranceScreen.tsx`: 실제 첫 미션 preview, 6개 미션 보드, 기록 흐름, 시작 CTA 우선 배치
- `src/features/paragraph-repair/ParagraphWorkbench.tsx`: 미션 상태·관계·단계 안내·작업면 구조
- `src/components/ProgressSteps.tsx`: 숫자·완료 상태·현재 단계 구분
- `src/features/paragraph-repair/steps/*.tsx`: 기존 기능 계약을 유지하면서 단계별 핵심 행동과 상태 피드백을 명확히 배치
- `src/features/paragraph-repair/FeedbackPanel.tsx`: 판정·근거·다음 행동이 읽히는 검토 메모 구조
- `src/features/report/LearningReport.tsx`: 6개 미션 요약, 처음 판단/최종 수리/근거 기록 구획

### 디자인 시스템·반응형

- `src/styles/tokens.css`: warm ivory, ink navy, muted coral, sage success 토큰
- `src/styles/app.css`, `entrance.css`, `workbench.css`, `report.css`, `screens.css`, `motion.css`: 화면별 파일 분리, 명시적 모바일 규칙, visible focus, reduced-motion, `gi-pulse`
- 모든 TS/TSX/CSS 파일은 500줄 미만입니다.
- 순서 카드의 컨트롤을 작은 폭에서 두 번째 행으로 감싸 320px/390px 가로 넘침을 없앴습니다.
- 다크 모드 분기, 외부 폰트, 외부 네트워크, 학생용 VoiceOver/TTS/녹음 기능은 추가하지 않았습니다. VoiceOver 검증은 프로젝트 규칙에 따라 범위에서 제외했습니다.

### 이미지·추적성

- 새 생성 장식 자산: `src/assets/generated/repair-desk-atmosphere-v2.webp`
- 중간 plate의 WebP 최적화본을 `src/assets/plates/`에 추가하고 PNG 원본은 Impeccable 비교와 롤백을 위해 보존했습니다.
- 새 자산의 프롬프트·사용 위치·검수 대기 상태는 [`docs/image-rights-ledger.md`](../docs/image-rights-ledger.md)와 [`education-webapp-redesign-assets.md`](./education-webapp-redesign-assets.md)에 기록했습니다.
- 이미지는 `aria-hidden` 장식이며, 제거해도 학습 문장·판정·근거·완주가 유지됩니다.

## 검증 결과

| 검사 | 결과 | 비고 |
|---|---|---|
| `npm run lint` | 통과 | ESLint |
| `npm run typecheck` | 통과 | TypeScript |
| `npm run test:run` | 통과 | 14개 파일, 110개 테스트 |
| `npm run test:a11y` | 통과 | 2개 테스트 |
| `npm run check:lines` | 통과 | TS/TSX/CSS 500줄 제한 |
| `npm run build` | 통과 | Vite production build |
| `npm run test:release` | 통과 | Pages asset 검사 4개 |
| Impeccable detector | 통과 | 최종 결과 findings `[]` |

`npm run test:e2e`는 리디자인 전 기준선에서 앱 assertion에 들어가기 전에 macOS Chromium의 `mach_port_rendezvous` / `SIGTRAP`으로 시작하지 못했습니다. 동일한 시작 방식을 반복해 제품 결함으로 오인하지 않았고, 인앱 브라우저의 실제 화면·단계 흐름 확인을 별도 증거로 사용했습니다.

## 브라우저 확인

Codex 인앱 브라우저에서 실제 로컬 앱을 확인했습니다.

- 1505×1045: warm ivory 작업대, 브랜드 헤더, 실제 첫 미션 문장, 6개 미션 목록, 첫 CTA가 한 화면의 정보 위계로 읽혔습니다.
- 390px: 입장 화면과 작업 화면에서 가로 넘침이 없고, 단계 제목에 포커스가 이동했습니다. 순서 수리 카드의 문장·위치 입력·위/아래 조작이 카드 안에서 줄바꿈되었습니다.
- 320px: `document.documentElement.scrollWidth === clientWidth`로 확인했고, `활동 시작하기` CTA가 첫 viewport 안에 보였습니다.
- 시작 → 읽기 → 중심 문장 선택 → 피드백 → 순서 단계까지 실제 조작했고, 업데이트 대화상자는 2026-08-30 리디자인 기록과 2026-08-28 기록을 표시했습니다. 단계 전환 후 `workbench-title`에 포커스가 이동했습니다.
- 긴 6개 미션 전체 자동화는 macOS 브라우저 세션 시간 제한으로 미션 5의 관련성 단계에서 중단되어, 전체 완주를 관찰했다고 주장하지 않습니다. 기능 회귀는 단위·접근성 테스트로 별도 확인했습니다.

## Impeccable 단계 상태

- comps: 통과 — 3개 방향 중 1개 승인
- spec: 통과 — 28개 영역, 5개 plate, 19개 텍스트 측정
- plates: 통과 — 5개
- hero fidelity: 보류 — `48.6%` (`structure 60%`, `color 81%`, `detail 5%`)

hero가 보류된 이유는 승인된 raster comp가 실제 제품에 없는 합성 미션명·레이아웃 topology·장식 배치를 포함했기 때문입니다. 실제 학생에게 보이는 콘텐츠를 placeholder로 덮어 gate를 강제 통과시키지 않았습니다. 제품 진실에 맞춘 hero comp를 새로 만든 뒤 재검토하는 것이 다음 시각 검증 작업입니다.

## 남은 검수와 범위 밖 항목

- [`docs/content-review.md`](../docs/content-review.md)의 교사·교과 콘텐츠 검토는 아직 승인되지 않았습니다.
- 새 생성 이미지의 맥락·권리·편향 사람 검수는 `pending`입니다.
- Safari, 실제 기기 물리 확대, VoiceOver는 이번 작업의 완료 근거가 아닙니다. VoiceOver는 프로젝트 규칙에 따라 구현·검증 범위에서 제외했습니다.
- 커밋, 푸시, GitHub Pages 배포, HVC 등록/동기화는 사용자가 별도로 요청하지 않아 진행하지 않았습니다.
