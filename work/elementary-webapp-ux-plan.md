# 초등 웹앱 UX 개선 계획

- **작성일:** 2026-08-31
- **상태:** 구현·검증 완료
- **모드:** `full`
- **대상:** `/Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop`
- **범위:** 모바일 행동 위계, 완료 후 학습 전이, 제한된 learner-facing 문구 개선
- **이번 사이클 제외:** 콘텐츠 판정 변경, 미션 추가, 새 이미지 생성, 시뮬레이션 구현, VoiceOver, 커밋·푸시·배포

## 1. 적용할 규칙

- 주 페르소나는 초3–4 준호, 초5–6 서윤을 보조 관점으로 사용합니다.
- `PRODUCT.md`, 프로젝트별 `design-system/paragraph-flow-repair-shop/MASTER.md`, 기존 리디자인 계획·감사·자산 원장을 우선합니다.
- evaluator, reducer, 고정 문장 fixture, 개인정보 경계, light mode, semantic DOM은 변경하지 않습니다.
- 이미지에는 문구·정답·점수·진행 상태를 넣지 않으며, 이번 사이클은 기존 자산을 재사용합니다.
- 중요한 단계 CTA의 `gi-pulse`와 reduced-motion 정적 대체를 유지합니다.
- 모든 파일은 500줄 미만으로 유지합니다.

## 2. 우선순위와 변경 설계

### EDU-UX-001 — 모바일에서 실제 과제 먼저

- `src/styles/workbench.css`의 `max-width: 900px` 규칙에 모바일 배치 순서를 추가합니다.
- `.workbench__task`를 먼저, `.workbench__guide`를 뒤로 배치합니다.
- 수리 메모·도구 이미지는 사라지지 않고 과제 완료 후 참고 영역으로 남깁니다.
- 데스크톱 1280px의 기존 좌측 안내/우측 과제 레이아웃은 유지합니다.

### EDU-UX-002 — 보고서의 전이 카드

- `src/features/report/LearningReport.tsx`의 세션 요약 바로 다음에 `다음 글에 써 볼 방법` section을 추가합니다.
- 세 단계는 실제 앱이 가르친 기능과 일치하게 `중심 생각 찾기`, `문장 관계 살피기`, `근거로 말하기`로 씁니다.
- `src/styles/report.css`에 기존 여백선·paper surface·sage/coral 토큰을 사용한 시각 계층과 520px 규칙을 추가합니다.
- 기존 보고서의 미션 기록·인쇄·재시작은 변경하지 않습니다.

### EDU-UX-003 — 완료 주의 문구의 행동 명료화

- `LearningReport`의 교사 검수·모델 범위 고지를 초등 학습자가 읽을 수 있는 문장으로 바꿉니다.
- `검수 중`과 “모든 글에 똑같이 맞지 않음”의 정직한 경계는 보존합니다.
- 버튼명·교과 판정 문구는 이번 사이클에서 임의로 바꾸지 않고 언어 감사 장부에 남깁니다.

## 3. TDD·구현 순서

1. 기준선 감사·언어 감사·시뮬레이션 결정을 문서로 고정합니다.
2. `LearningReport.test.tsx`에 transfer card와 learner-facing 고지의 기대 문구를 먼저 추가합니다.
3. 테스트가 새 문구 부재로 실패하는지 확인한 뒤 `LearningReport.tsx`와 `report.css`를 수정합니다.
4. `workbench.css`의 responsive ordering을 수정하고, 기존 DOM/키보드 계약을 보존합니다.
5. `src/update/updateHistory.ts`에 2026-08-31 개선 내역을 추가합니다.
6. lint/typecheck/unit/a11y/line/build/release 검사를 실행합니다.
7. 동일한 브라우저 시나리오를 1280×720, 375×812, 320×800에서 재실행합니다.
8. 최종 감사·언어 장부·보고서를 갱신합니다.

## 4. 수용 기준

### 행동 위계

- 320/375px에서 실제 문장·선택·제출 영역이 `수리 메모`와 장식 도구보다 먼저 나옵니다.
- 첫 미션의 선택지와 CTA를 DOM/화면에서 확인할 수 있고, `scrollWidth === clientWidth`입니다.
- 데스크톱에서는 기존 과제/안내 양열 구조가 유지됩니다.

### 학습 전이

- `수리 기록` 상단에 `다음 글에 써 볼 방법`과 3단계 전략이 보입니다.
- 전략 문구가 현재 미션의 학습 목표를 벗어나지 않고, 점수·순위를 추가하지 않습니다.
- 인쇄 화면에서 transfer card가 읽히며, 버튼은 인쇄 시 숨겨지는 기존 계약을 따릅니다.

### 언어·안전

- 완료 고지는 아동 친화적이지만 교사 검수 중·모델의 한계를 숨기지 않습니다.
- 내부 ID·디버그·시스템 용어가 새 learner-facing UI에 추가되지 않습니다.
- VoiceOver/TTS/녹음/저장/외부 요청은 추가하지 않습니다.

## 5. 검증 명령

```text
npm run lint
npm run typecheck
npm run test:run
npm run test:a11y
npm run check:lines
npm run build
npm run test:release
```

브라우저에서는 Codex 인앱 브라우저로 로컬 URL을 열고, 기존 full-flow 행동을 동일하게 반복합니다. 이번 요청은 릴리스 요청이 아니므로 CI·Pages·공개 URL은 실행하지 않습니다.

## 6. 롤백·남은 사람 검수

- 이번 사이클 변경 파일만 되돌릴 수 있도록 diff를 확인합니다. broad reset/checkout은 사용하지 않습니다.
- 새 이미지나 의존성은 추가하지 않습니다.
- 문단 fixture와 판정의 국어 교사 검수, 생성 자산의 맥락·권리·편향 검수는 계속 `human-review/pending`입니다.
- 실제 학생 이해도와 Safari/물리 기기 사용성은 이 브라우저 감사가 대신하지 않습니다.
