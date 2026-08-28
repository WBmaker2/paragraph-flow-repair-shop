# Paragraph Flow Repair Shop Implementation Plan

> **상태:** 구현 전 계획 승인 대기. 이 문서는 실행 가능한 구현 순서만 정의하며 코드, 패키지 설치, Git 초기화, 커밋, 푸시, 배포, HVC 등록을 수행하지 않는다.

| 항목 | 내용 |
|---|---|
| 작성일 | 2026-08-28 |
| 프로젝트 | 문단 흐름 수리소 |
| 대상 | 초등 3~6학년 |
| 교과 | 국어 |
| 권장 활동 시간 | 15~25분 |
| 미래 프로젝트 루트 | /Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop |
| 계획 문서 | /Volumes/ External Drive 256G/Dev2/codex/vibecoding-lab/docs/superpowers/plans/2026-08-28-paragraph-flow-repair-shop-implementation-plan.md |
| 구현 여부 | 구현하지 않음 |
| 배포 여부 | 배포하지 않음 |

**Goal:** 학생이 중심 문장, 뒷받침 문장, 이어 주는 말, 관련 없는 문장을 근거로 문단의 흐름을 진단하고 여러 타당한 순서로 수리하는 정적 국어 학습 앱을 만든다.

**Architecture:** Vite + React + TypeScript 정적 SPA에서 검수된 고정 미션 데이터, 순수 판정 함수, useReducer 세션 상태, 단계별 화면을 분리한다. 학생 응답은 현재 탭 메모리에만 두고 서버, 로그인, 외부 AI, 분석 SDK, 광고, 쿠키, localStorage, sessionStorage를 사용하지 않는다.

**Tech Stack:** Vite, React, TypeScript, CSS, Vitest, React Testing Library, user-event, vitest-axe, Playwright, axe-core, 정적 SVG와 이미지 생성 모델로 제작한 로컬 자산.

**Visual Thesis:** 밝은 종이 작업대 위 문장 띠와 연결 표식을 사용한다. 글자가 시각적 중심이며 공구 일러스트는 기능을 보조하되 문장 순서의 정답을 암시하지 않는다.

---

## 1. 계획 경계와 승인 게이트

- 이 문서 작성은 구현 승인이나 출시 승인이 아니다.
- 구현 시작 전 교과 내용, 어린이용 문구, 고정 미션의 정답·복수 정답·판단 보류 규칙을 교사 또는 교과 검수자가 승인한다.
- 이미지가 필요한 화면은 구현 단계에서 이미지 생성 모델로 맥락에 맞는 자산을 만들고 **docs/image-rights-ledger.md**에 프롬프트, 생성일, 파일명, 사용 위치를 기록한다.
- 학생용 VoiceOver, 음성 내레이션, TTS, 녹음은 범위에서 제외한다. 키보드, 의미 있는 HTML, 포커스, 자동 접근성 검사는 유지하되 VoiceOver 수동 검증은 계획과 완료 기준에서 제외한다.
- 구현 오케스트레이터가 gpt-5.6-sol 또는 gpt-5.6-terra이면 실제 코딩 담당 하위 에이전트는 gpt-5.6-luna를 사용한다. 사용할 수 없을 때만 5.3 Codex Spark를 사용한다.
- 푸시, GitHub Pages, HVC 등록은 로컬 검증 완료 뒤 사용자의 별도 출시 승인으로만 진행한다.

## 2. 학습 계약과 비중복성

### 2.1 학습 계약

- 학생은 문단의 중심 생각과 직접 관련된 문장을 구분한다.
- 학생은 시간 순서, 원인과 결과, 비교, 문제와 해결의 관계를 문장 근거로 설명한다.
- 학생은 이어 주는 말이 앞뒤 관계와 맞는지 확인한다.
- 학생은 가능한 순서가 둘 이상인 문단에서 자신의 순서를 근거로 방어하고 수정한다.
- 결과는 점수, 속도, 등급, 순위 대신 최초 판단, 사용한 근거, 수정 결과를 보여 준다.
- 정답 하나를 강요할 수 없는 미션은 검수된 복수 해법 또는 판단 보류를 정식 결과로 인정한다.

### 2.2 기존 앱과의 구별

| 가까운 기존 영역 | 이 앱이 구현하는 핵심 행동 | 명시적으로 제외하는 행동 |
|---|---|---|
| 문장 만들기 공장 | 완성 문장 여러 개 사이의 문단 관계 수리 | 낱말 어순과 문장 부호 배열 |
| 지시어 관제실 | 중심 생각과 연결 관계를 이용한 문장 순서 | 이것·그곳이 가리키는 대상 찾기 |
| 정보 손실 통신소 | 한 문단 내부의 관련성·조직·이어 주는 말 | 전달 전후 빠짐과 뜻 변화 추적 |

## 3. 학습 흐름 시각화

~~~mermaid
flowchart LR
    A[입구] --> B[문단 전체 읽기]
    B --> C[중심 문장 찾기]
    C --> D[문장 순서 수리]
    D --> E[관련 없는 문장 분리]
    E --> F[이어 주는 말 선택]
    F --> G[수리 이유]
    G --> H[문단 기록]
~~~

- 단계가 바뀌면 **mainHeadingRef**에 프로그래밍 방식으로 초점을 옮기고 새 단계의 시작점으로 스크롤한다.
- 뒤로 가기는 직전 단계의 응답을 보존한다. 처음부터 다시 하기는 확인 대화상자 뒤 세션 메모리를 완전히 비운다.
- 새로고침하면 응답이 사라짐을 입구와 결과 화면에 어린이용 문장으로 알린다.

## 4. 고정 미션 사양

| 미션 ID | 장면 | 학생이 하는 일 | 성공 증거 |
|---|---|---|---|
| paragraph-garden-01 | 학교 화단 씨앗 심기 | 시간 순서 문장 4개 배치 | 먼저·그다음 단서와 두 유효 순서 중 하나 연결 |
| paragraph-rain-02 | 젖은 운동장 | 원인과 결과 구분 | 비가 옴→바닥이 젖음 관계를 뒤집지 않음 |
| paragraph-library-03 | 두 독서 공간 비교 | 같은 기준끼리 문장 묶기 | 조용함과 밝기 비교가 각각 대응 |
| paragraph-bottle-04 | 잃어버린 물병 찾기 | 문제와 해결 문장 연결 | 문제 전에 해결 결과를 단정하지 않음 |
| paragraph-butterfly-05 | 나비 관찰 설명 | 중심 문장과 관련 없는 문장 분리 | 날개 특징과 무관한 급식 문장 제거 |
| paragraph-playground-06 | 놀이 공간 제안 | 검수된 두 문단 순서 중 선택 | 중심 생각·근거·마무리 관계를 말로 설명 |

- 정확히 6개 미션을 제공한다. 런타임 무작위 생성은 하지 않는다.
- 미션 ID, 선택지 ID, 판정 ID는 코드·테스트·문서에서 동일한 문자열을 사용한다.
- 모든 미션은 **sourceNote**, **reviewStatus**, **misconceptionGuard**를 가지며 누락 시 빌드를 실패시킨다.
- 학생 이름, 실제 학급 사건, 위치, 사진, 생년월일을 입력하거나 저장하지 않는다.

### 4.1 구현 고정 문장 fixture

- `paragraph-garden-01`: G1 `우리 반은 화단에 씨앗을 심었습니다.` G2 `먼저 흙을 고르게 다듬었습니다.` G3 `작은 구멍마다 씨앗을 넣었습니다.` G4 `씨앗 사이에 이름표도 꽂았습니다.` G5 `마지막으로 흙을 덮고 물을 주었습니다.` GX `오늘 급식에는 국수가 나왔습니다.` 승인 순서는 `G1-G2-G3-G4-G5`, `G1-G2-G4-G3-G5`다.
- `paragraph-rain-02`: R1 `비가 온 뒤 운동장 모습이 달라졌습니다.` R2 `밤새 비가 많이 왔습니다.` R3 `운동장 바닥이 젖었습니다.` R4 `그래서 체육 수업은 체육관에서 했습니다.` RX `새 우산은 노란색이었습니다.` 승인 순서는 `R1-R2-R3-R4`다.
- `paragraph-library-03`: L1 `도서관에는 책을 읽는 두 공간이 있습니다.` L2 `창가 공간은 햇빛이 밝게 들어옵니다.` L3 `안쪽 공간은 조명이 부드럽습니다.` L4 `창가 쪽은 대화 소리가 조금 들립니다.` L5 `안쪽 공간은 더 조용합니다.` 승인 순서는 밝기 묶음과 소리 묶음의 순서를 바꿀 수 있는 `L1-L2-L3-L4-L5`, `L1-L4-L5-L2-L3`다.
- `paragraph-bottle-04`: B1 `점심시간 뒤 물병이 보이지 않았습니다.` B2 `책상 아래를 살펴보았지만 없었습니다.` B3 `마지막으로 간 미술실을 떠올렸습니다.` B4 `미술실 선반에서 물병을 찾았습니다.` B5 `앞으로 물병에 이름표를 붙이기로 했습니다.` 승인 순서는 `B1-B2-B3-B4-B5`다.
- `paragraph-butterfly-05`: F1 `관찰한 나비의 날개에는 두 가지 특징이 있었습니다.` F2 `날개 가장자리는 검은색이었습니다.` F3 `가운데에는 둥근 무늬가 있었습니다.` F4 `두 특징을 그림에 표시했습니다.` FX `점심에는 과일을 먹었습니다.` 승인 순서는 `F1-F2-F3-F4`, `F1-F3-F2-F4`다.
- `paragraph-playground-06`: P1 `빈 공간에 작은 그늘 쉼터를 만들면 좋겠습니다.` P2 `햇볕이 강한 날에도 쉴 수 있습니다.` P3 `잠시 쉬고 다시 안전하게 놀이할 수 있습니다.` P4 `그래서 그늘 쉼터가 우리에게 도움이 됩니다.` 승인 순서는 `P1-P2-P3-P4`, `P1-P3-P2-P4`다.
- 모든 문장과 승인 순서는 `missionFixtures.ts`에 그대로 고정한다. 문장 교정·교과 적합성은 국어 교사 검수 전 `reviewStatus: pending`으로 유지한다.

## 5. 판정 계약

- evaluateOrder는 exactOrder 하나가 아니라 precedencePairs와 acceptedOrderIds를 검사한다.
- offTopicSentenceIds에 없는 문장은 단지 위치가 어색하다는 이유로 삭제 정답이 되지 않는다.
- connector 선택은 앞뒤 relation과 일치해야 하며 같은 기능의 검수된 표현을 복수 정답으로 인정한다.
- 중심 문장 선택은 topicSentenceIds 중 하나를 허용하며 보조 문장이 주제를 더 구체적으로 표현하는 사례는 content review에서 명시한다.
- 자유 서술 이유는 채점하지 않고 근거 문장 카드와 관계 라벨 선택으로 증거를 남긴다.

## 6. MVP 범위

**포함**

- 입구, 안내 미션 1개, 적용 미션 5개, 단계별 근거 선택, 수정 기회, 결과 기록, 다시 하기, 인쇄용 결과, 업데이트 내역.
- 마우스·터치·키보드 동등 조작, 320px 이상 반응형 화면, 200% 글자 확대, 고대비 포커스, 축소 모션.
- 모든 학습 자료와 자산을 동일 출처에서 제공하는 오프라인 친화 정적 앱.

**제외**

- 자유 입력 AI 채점, 생성형 AI 런타임 호출, 실시간 검색, 학생 계정, 서버 저장, 학급 순위, 타이머 압박, 광고, 분석.
- 실제 기기·신체·안전 결과를 보장하는 표현, 검수되지 않은 교과서 복제, 외부 이미지 핫링크.
- 다크 모드와 prefers-color-scheme 기반 테마 전환. 앱은 밝은 교실용 라이트 모드로 고정한다.
- VoiceOver 구현·검증, 학생용 음성 안내, TTS, 음성 녹음.

## 7. 핵심 타입과 순수 함수

### 7.1 TypeScript 계약

~~~ts
type MissionId = "paragraph-garden-01" | "paragraph-rain-02" | "paragraph-library-03" | "paragraph-bottle-04" | "paragraph-butterfly-05" | "paragraph-playground-06";
type Relation = "sequence" | "cause-effect" | "compare" | "problem-solution" | "description" | "claim-support";
interface SentenceCard { readonly id: string; readonly text: string; readonly roles: readonly ("topic" | "support" | "off-topic" | "closing")[]; }
interface PrecedencePair { readonly beforeId: string; readonly afterId: string; readonly reasonKey: string; }
interface ConnectorOption { readonly id: string; readonly text: string; readonly relations: readonly Relation[]; }
interface ParagraphMission { readonly id: MissionId; readonly relation: Relation; readonly sentences: readonly SentenceCard[]; readonly topicSentenceIds: readonly string[]; readonly precedencePairs: readonly PrecedencePair[]; readonly acceptedOrderIds: readonly string[]; readonly offTopicSentenceIds: readonly string[]; readonly connectorOptions: readonly ConnectorOption[]; readonly sourceNote: string; readonly reviewStatus: "pending" | "approved"; readonly misconceptionGuard: string; }
interface ParagraphEvaluation { readonly accepted: boolean; readonly satisfiedPairs: readonly string[]; readonly brokenPairs: readonly string[]; readonly evidenceKeys: readonly string[]; }
type SessionStep = "INTRO" | "READ" | "TOPIC" | "ORDER" | "RELEVANCE" | "CONNECTOR" | "EXPLAIN" | "REPORT";
~~~

### 7.2 단일 판정 경계

- **src/domain/paragraphEvaluator.ts**만 정오·충족·판단 보류를 계산한다.
- 컴포넌트는 정답 배열을 직접 조회하지 않고 evaluateTopic(), evaluateOrder(), evaluateOffTopic(), evaluateConnector()의 결과만 렌더링한다.
- **src/content/validateContent.ts**는 6개 미션, ID 유일성, 참조 무결성, 최소 복수 해법, 어린이용 피드백, 검수 메타데이터를 검사한다.
- 잘못된 콘텐츠는 개발·빌드 시 예외로 중단하고, 학생 화면에서 임의로 추측해 복구하지 않는다.

## 8. 예상 파일 구조와 책임

~~~text
paragraph-flow-repair-shop/
  .github/workflows/ci.yml
  .github/workflows/deploy-pages.yml
  package.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  eslint.config.js
  tsconfig.json
  index.html
  public/favicon.svg
  scripts/check-file-lines.mjs
  src/main.tsx
  src/app/App.tsx
  src/app/sessionReducer.ts
  src/app/sessionReducer.test.ts
  src/domain/types.ts
  src/domain/paragraphEvaluator.ts
  src/domain/paragraphEvaluator.test.ts
  src/content/missions.ts
  src/content/missions.test.ts
  src/content/validateContent.ts
  src/content/validateContent.test.ts
  src/features/paragraph-repair/EntranceScreen.tsx
  src/features/paragraph-repair/ParagraphWorkbench.tsx
  src/features/paragraph-repair/FeedbackPanel.tsx
  src/features/report/LearningReport.tsx
  src/features/report/print.css
  src/components/ActionButton.tsx
  src/components/ModalDialog.tsx
  src/components/ProgressSteps.tsx
  src/components/UpdateHistoryButton.tsx
  src/components/UpdateHistoryDialog.tsx
  src/accessibility/AccessibilityToolbar.tsx
  src/update/updateHistory.ts
  src/assets/generated/paper-repair-workbench.webp
  src/styles/tokens.css
  src/styles/app.css
  src/styles/motion.css
  src/test/setup.ts
  tests/a11y/app.a11y.test.tsx
  tests/privacy/runtime-boundary.test.ts
  tests/release/pages-assets.test.ts
  e2e/learner-flow.spec.ts
  e2e/keyboard.spec.ts
  e2e/mobile-reduced-motion.spec.ts
  docs/content-review.md
  docs/image-rights-ledger.md
  docs/qa/acceptance-checklist.md
~~~

- 기능 파일이 500줄에 가까워지면 미션 화면, 판정, 피드백, 보고서를 즉시 분리한다.
- TS, TSX, CSS 파일은 각각 500줄 미만이어야 하며 **npm run check:lines**가 위반 파일 경로를 출력하고 실패한다.
- 콘텐츠 데이터와 판정 코드는 서로 import할 수 있지만 UI 컴포넌트에서 콘텐츠 내부 정답 필드를 직접 읽지 않는다.

## 9. 화면과 상태 전이

1. **입구** — 문단은 문장이 모인 것이 아니라 중심 생각으로 이어진다는 목표를 안내한다.
2. **전체 읽기** — 문장 띠를 원래 순서로 읽고 최초 흐름 판단을 남긴다.
3. **중심 문장** — 중심 생각을 가장 잘 담은 문장을 고르고 근거 낱말을 표시한다.
4. **순서 수리** — 문장별 위·아래 이동 버튼과 위치 번호 입력으로 재배치한다.
5. **관련성 점검** — 문단에서 벗어난 문장을 별도 보관함으로 옮긴다.
6. **이어 주는 말** — 앞뒤 관계에 맞는 표현을 선택하고 완성 문단을 읽는다.
7. **수리 기록** — 처음 순서와 최종 순서, 사용한 관계 근거를 나란히 보여 준다.

**SessionState 공통 규칙**

- step은 정의된 전이표를 통해서만 바뀐다.
- missionIndex 범위는 0부터 5까지다.
- 현재 미션 응답, 최초 판단, 근거, 수정 기록은 불변 업데이트한다.
- COMPLETE 이후에는 답을 바꾸지 못하고 다시 보기와 인쇄만 허용한다.
- 알 수 없는 action, 범위를 벗어난 missionIndex, 이전 revision 응답은 상태를 바꾸지 않는다.

## 10. 시각·접근성·자산 계획

- 기본 본문 16px 이상, 줄 간격 1.6 이상, 터치 목표 44×44 CSS px 이상을 유지한다.
- 색만으로 상태를 구분하지 않는다. 선택 상태는 체크 아이콘, 굵기, 테두리, **선택됨** 텍스트와 aria-pressed를 함께 사용한다.
- 필수 다음 행동인 **문단 시험하기**, **수리 완료 확인**에만 gi-pulse를 사용한다.
- prefers-reduced-motion: reduce에서는 이동과 맥박을 제거하고 3px 고정 외곽선과 **필수** 배지로 대체한다.
- 업데이트 내역은 헤더의 작은 버튼으로 모든 단계에서 열 수 있고 닫으면 원래 초점으로 돌아간다. 최초 항목은 **2026-08-28 — 구현 계획 확정**이며 실제 수정 때마다 최신 날짜를 앞에 추가한다.
- 320×568, 375×812, 768×1024, 1280×800에서 주요 행동이 긴 설명 아래 묻히지 않도록 현재 할 일과 CTA를 먼저 배치한다.
- 이미지를 숨기거나 로드하지 못해도 제목, 지시, 선택지, 판정, 보고서를 완주할 수 있어야 한다.

**생성 자산**

- **src/assets/generated/paper-repair-workbench.webp** — 글자가 없는 밝은 종이 수리 작업대 배경.
- 문장 띠, 연결 화살표, 순서 번호는 확대와 인쇄를 위해 HTML과 CSS로 구현한다.
- 장식 그림을 제거해도 문단의 모든 문장과 근거가 그대로 남아야 한다.

## 11. 오류·개인정보·안전 처리

- ErrorBoundary는 어린이용 **활동을 다시 불러오지 못했어요** 문장과 **처음부터 다시 하기**만 제공하며 기술 스택이나 원시 오류를 노출하지 않는다.
- window.fetch, XMLHttpRequest, WebSocket, EventSource, sendBeacon을 런타임 경계 테스트에서 차단·감시하고 외부 요청 0건을 요구한다.
- localStorage, sessionStorage, IndexedDB, document.cookie 쓰기를 금지한다.
- 인쇄 결과에는 이름 입력란, 식별자, 브라우저 메타데이터를 넣지 않는다.
- 교육 모형은 실제 세계 전체를 보장하지 않는다는 한계를 해당 피드백과 교사용 검수 문서에 명시한다.

## 12. TDD 구현 순서

### Task 0 — 계획 고정과 저장소 준비

**미래 파일:** README.md, package.json, 설정 파일, docs/content-review.md.

- [ ] 이 계획을 새 프로젝트 루트에 복사하고 SHA-256을 원본과 대조한다.
- [ ] package scripts를 dev, build, lint, typecheck, test:run, test:a11y, test:e2e, check:lines, verify로 고정한다.
- [ ] vite.config.ts는 개발 base를 /, production base를 /paragraph-flow-repair-shop/로 고정하고 playwright.config.ts의 baseURL은 preview 서버와 같은 하위 경로를 사용한다.
- [ ] scripts/check-file-lines.mjs는 src와 tests의 TS·TSX·CSS 파일을 검사해 500줄 이상이면 파일 경로와 줄 수를 출력하고 종료 코드 1을 반환한다.
- [ ] Git 초기화·원격 생성은 구현 승인 뒤에만 한다.
- [ ] 미래 커밋: **chore: scaffold paragraph-flow-repair-shop**

### Task 1 — 콘텐츠 스키마와 검수기

**RED:** src/content/missions.test.ts, src/content/validateContent.test.ts를 먼저 작성한다.

- [ ] 6개 미션, ID 유일성, 모든 참조, 검수 상태, 오개념 방지 문구가 없을 때 각각 실패하게 한다.
- [ ] 각 미션에 4~6개 문장, 중심 문장 1개 이상, precedencePairs 2개 이상, 어린이용 관계 피드백이 있는지 검사한다.
- [ ] 실패를 확인한 뒤 missions.ts와 validateContent.ts의 최소 구현을 작성한다.
- [ ] 미래 커밋: **feat: define reviewed paragraph-repair missions**

### Task 2 — 순수 판정 함수

**RED:** src/domain/paragraphEvaluator.test.ts에 정상·경계·복수 해법·판단 보류·잘못된 입력 사례를 먼저 작성한다.

- [ ] 정확 순서 6건, 허용된 대안 순서 3건, 한 쌍만 뒤집힌 순서 4건, 관련 없는 문장 오판 3건, 동등 연결어 4건을 고정한다.
- [ ] 컴포넌트 없이 순수 함수만으로 여섯 미션의 기대 결과를 재현한다.
- [ ] mutation 없이 readonly 입력을 처리하고 결과에 어린이용 evidenceKeys를 반환한다.
- [ ] 미래 커밋: **feat: add deterministic paragraph-repair evaluator**

### Task 3 — 세션 reducer와 전이 잠금

**RED:** sessionReducer.test.ts에서 건너뛰기, 오래된 응답, 완료 뒤 수정, 재시작을 먼저 실패시킨다.

- [ ] 허용 전이만 통과시키고 필수 응답이 없으면 다음 단계로 가지 않는다.
- [ ] back은 응답을 보존하고 restartConfirmed는 초기 상태를 새 객체로 만든다.
- [ ] 새로고침 복구나 영구 저장은 구현하지 않는다.
- [ ] 미래 커밋: **feat: add guarded learning session**

### Task 4 — 앱 셸과 입구

**RED:** EntranceScreen과 App의 컴포넌트 테스트를 먼저 작성한다.

- [ ] 학습 목표, 6개 미션, 예상 시간, 저장하지 않음, 업데이트 내역을 화면에 표시한다.
- [ ] Enter와 Space로 시작하며 시작 후 mainHeadingRef에 초점이 이동한다.
- [ ] 작은 화면에서 핵심 시작 버튼이 첫 뷰포트의 주요 흐름 안에 보인다.
- [ ] 미래 커밋: **feat: build 문단 흐름 수리소 entrance**

### Task 5 — 핵심 학습 화면

**RED:** ParagraphWorkbench.test.tsx에서 실제 학생 행동 순서를 먼저 작성한다.

- [ ] 위·아래 버튼으로 문장을 옮기고, 관련 없는 문장을 분리하고, 연결어를 고른 뒤에만 완성 문단을 열 수 있는지 검사한다.
- [ ] 클릭, 터치, Tab/Shift+Tab, Enter/Space로 같은 결과를 만든다.
- [ ] 오답은 정답만 공개하지 않고 확인할 근거와 한 번의 수정 기회를 제공한다.
- [ ] 미래 커밋: **feat: implement paragraph-repair learner flow**

### Task 6 — 결과 기록·인쇄·업데이트 내역

**RED:** LearningReport와 UpdateHistoryDialog 테스트를 먼저 작성한다.

- [ ] 최초 판단→근거→수정 결과를 미션별로 보여 주며 점수와 순위를 만들지 않는다.
- [ ] 인쇄 CSS는 A4 세로, 검정 텍스트, 흰 배경, 제어 버튼 숨김을 보장한다.
- [ ] 대화상자는 Escape와 닫기 버튼을 지원하고 닫은 뒤 호출 버튼으로 초점을 복원한다.
- [ ] 미래 커밋: **feat: add evidence report and update history**

### Task 7 — 시각 자산·라이트 모드·모션

**RED:** 자산 manifest와 모션 CSS 테스트를 먼저 작성한다.

- [ ] 이미지 생성 모델로 승인된 자산만 만들고 로컬 파일과 권리 장부의 1:1 대응을 검사한다.
- [ ] 이미지 속 글자·정답·색상만으로 전달되는 정보가 없도록 한다.
- [ ] gi-pulse 대상은 두 필수 버튼으로 제한하고 축소 모션에서 animation-name이 none인지 검사한다.
- [ ] 미래 커밋: **feat: add reviewed classroom visual system**

### Task 8 — 접근성·개인정보·E2E

**RED:** 아래 E2E와 경계 테스트를 먼저 작성한다.

- 시간 순서 안내 미션을 유효한 두 순서로 각각 완료한다.
- 원인과 결과를 뒤집었을 때 관계 근거 피드백을 확인한다.
- 관련 없는 문장을 제거하지 않으면 완료 버튼이 잠긴다.
- 키보드만으로 문장 순서를 바꾸고 포커스가 이동한 문장에 남는다.
- 6개 문단 뒤 보고서에서 최초·최종 순서를 비교한다.
- 200% 확대와 320px에서 문장 띠가 가로 스크롤을 만들지 않는다.
- 축소 모션에서 문장 이동 애니메이션과 gi-pulse가 제거된다.
- 외부 요청과 브라우저 저장 쓰기가 없다.

- [ ] 자동 axe 검사에서 serious와 critical 위반 0건을 요구한다.
- [ ] Playwright는 Pages 하위 경로를 위해 page.goto('./')를 사용한다.
- [ ] 320px와 375px에서 document.documentElement.scrollWidth가 clientWidth를 넘지 않는다.
- [ ] VoiceOver 수동 검증은 실행하거나 완료로 보고하지 않는다.
- [ ] 미래 커밋: **test: verify learner flow and privacy boundary**

### Task 9 — 출시 준비와 HVC

- [ ] npm run verify가 모두 통과한 뒤에만 별도 출시 승인을 요청한다.
- [ ] 승인 후 WBmaker2/paragraph-flow-repair-shop 저장소, main 브랜치, Pages build_type=workflow를 사용한다.
- [ ] GitHub Actions 성공 뒤 https://wbmaker2.github.io/paragraph-flow-repair-shop/ 에서 제목, favicon, HTML 참조 자산, 콘솔 오류 0건, 실제 학습 흐름, 375px 화면을 확인한다.
- [ ] HVC 관리자 등록과 정적 갤러리 동기화는 공개 앱 확인 뒤 별도 단계로 수행한다.
- [ ] 최종 보고에는 배포 URL과 https://www.vibehong.shop/ 확인 링크를 클릭 가능하게 제공한다.
- [ ] 미래 커밋: **docs: record paragraph-flow-repair-shop release evidence**

## 13. 검증 명령과 기대 결과

모든 명령은 미래 프로젝트 루트에서 실행한다.

    npm run lint
    npm run typecheck
    npm run test:run
    npm run test:a11y
    npm run check:lines
    npm run build
    npm run test:e2e
    npm run verify
    git diff --check

기대 결과:

- lint와 typecheck 오류 0건.
- 단위·컴포넌트 테스트 실패 0건, 6개 미션과 모든 음성·네트워크 금지 경계 포함.
- 자동 접근성 serious/critical 위반 0건.
- src와 tests의 TS, TSX, CSS 파일 500줄 이상 0개.
- dist/index.html과 해시 자산 생성, base URL이 /paragraph-flow-repair-shop/로 빌드됨.
- 아래 명시한 E2E 시나리오 전부 통과.
- git diff --check 출력 없음.

## 14. 앱별 완료 기준

1. 허용된 대안 순서를 오답으로 표시하지 않는다.
2. 문장 이동은 드래그 없이 위·아래 버튼과 키보드로 완료된다.
3. 삭제가 아니라 관련 없는 문장 보관함으로 이동해 원문을 숨기지 않는다.
4. 모든 연결어 피드백은 앞뒤 문장을 함께 다시 보여 준다.
5. 결과 보고서가 총점 대신 관계별 수리 근거를 보여 준다.

## 15. 사람 검수와 증거 경계

- **자동화로 증명:** 타입, 순수 판정, 콘텐츠 무결성, 키보드 흐름, 축소 모션, 가로 넘침, 개인정보·네트워크 경계, 빌드 자산.
- **사람 검수 필요:** 교과 정확성, 어린이 문장 난이도, 생성 이미지의 맥락·편향·권리, 실제 태블릿 가독성.
- **명시적 제외:** VoiceOver 구현 및 검증.
- 자동화 통과를 인간 교과 검수, 출시 승인, 공개 배포, HVC 등록 완료로 표현하지 않는다.

## 16. 계획 자체 검토

- [x] TBD, TODO, placeholder, 임시 콘텐츠가 없다.
- [x] 여섯 미션 ID와 타입·테스트·화면 명칭이 일치한다.
- [x] 복수 정답과 판단 보류가 필요한 곳에서 단일 정답을 강요하지 않는다.
- [x] 모든 경로가 무로그인·무서버·무학생 개인정보 원칙을 지킨다.
- [x] 필수 버튼 두 개만 gi-pulse를 사용하고 축소 모션 대체가 있다.
- [x] 이미지 생성 자산과 프로그램 SVG의 역할이 분리되어 있다.
- [x] 구현, 테스트 실행, 커밋, 배포를 아직 수행하지 않았다고 기록한다.

## 17. 구현 인계

구현 승인 후 Task 0부터 순서대로 진행한다. 각 기능 Task는 **실패 테스트 작성 → 의도한 실패 확인 → 최소 구현 → 통과 확인 → 관련 파일만 커밋** 순서를 지킨다. 한 Task의 검증이 실패한 채 다음 Task로 넘어가지 않는다.
