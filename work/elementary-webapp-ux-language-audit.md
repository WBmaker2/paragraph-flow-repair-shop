# 초등 웹앱 학습자 문구 감사

- **작성일:** 2026-08-31
- **대상 학년:** 초3–4 준호, 초5–6 서윤
- **자료:** 실제 로컬 브라우저 DOM, `inventory_learner_text.py` 후보 장부, `PRODUCT.md`, 기존 콘텐츠·판정 계약
- **주의:** 후보 수집 결과는 자동 인증이 아니며, 아래 표는 상태와 학습 의도를 함께 본 수동 triage입니다.

## 1. 상태별 문구 장부

| 화면/상태 | 표면 | 현재 문구 | 신호 | 판단·처리 |
|---|---|---|---|---|
| 입장 | heading | 문단을 읽고, 근거로 고쳐요. | 낮음 | 목표가 직접적이며 유지 |
| 입장 | instruction | 문단은 문장이 모인 것이 아니라, 중심 생각으로 이어진 글이에요. | abstract-or-formal | `중심 생각`을 바로 풀어 주므로 초3–6에서 사용 가능, 유지 |
| 입장 | button | 활동 시작하기 | 낮음 | 행동과 결과가 일치, 유지 |
| READ | instruction | 문단 전체를 먼저 읽고, 처음 느낌을 기록해요. | 낮음 | 한 단계 행동, 유지 |
| READ | choice | 자연스러워요 / 고쳐야 할 것 같아요 | 낮음 | 처음 판단의 두 갈래가 분명, 유지 |
| TOPIC | instruction | 문단의 중심 생각을 가장 잘 담은 문장을 골라요. | abstract-or-formal | `중심 생각`은 입장 설명과 연결됨, 유지 |
| ORDER | button | 문단 시험하기 | abstract-or-formal | 실제로 현재 순서를 평가하는 행동이며 정답 공개가 없어 유지 |
| RELEVANCE | instruction | 문단의 흐름과 관계없는 문장을 찾으면 보관함으로 옮겨요. 없다면 없다고 표시해요. | multiple-actions, abstract-or-formal | 상태별 행동은 정확하나 길이가 있음. 다음 콘텐츠 검수에서 두 문장으로 나눌 후보 |
| RELEVANCE | button | 관련성 점검 완료 | abstract-or-formal, inconsistent-label | “옮기기/없음 표시 후 확인”의 결과를 말함. 기능 테스트 계약상 이번 사이클 유지 |
| CONNECTOR | instruction | 앞뒤 문장을 읽고, 관계에 맞는 이어 주는 말을 골라요. | abstract-or-formal | 앞/뒤 대상과 행동이 분명, 유지 |
| EXPLAIN | label | 수리 이유 (선택) | abstract-or-formal | 선택 사항이 명확하나 `수리`는 제품 은유. 유지 |
| FEEDBACK | recovery | 다시 확인해 볼까요? / 위·아래 버튼으로 한 번 더 옮겨 볼 수 있어요. | 낮음 | 비난 없이 회복 행동 제공, 유지 |
| REPORT | completion | 다음 글에도 가져갈 생각 | missing-recovery | 전이 의도는 있으나 실제 행동이 없음. `다음 글에 써 볼 방법` 카드로 보강 |
| REPORT | notice | 이 앱의 문단과 판정은 국어 교사 검수 중이며, 교육 모형은 실제 세계 전체를 보장하지 않아요. | abstract-or-formal, technical-or-internal | 정직한 경계는 보존하되 아동 친화적으로 변환 |

## 2. 승인된 before/after

### 완료 고지

- **Before:** `이 앱의 문단과 판정은 국어 교사 검수 중이며, 교육 모형은 실제 세계 전체를 보장하지 않아요.`
- **After:** `이 앱의 문단과 판정은 국어 교사가 검수 중이에요. 이 방법이 모든 글에 똑같이 맞는 것은 아니에요. 글의 근거를 함께 살펴보세요.`
- **Target grade:** 초3–6
- **Learning intent preserved:** yes — 교사 검수 중이라는 상태와 모든 글에 기계적으로 적용하지 않는다는 경계를 유지
- **Screen/state:** `수리 기록` 완료 화면 / notice / 정적 learner-facing 문구
- **Difficulty signals:** abstract-or-formal, technical-or-internal
- **Curriculum accuracy:** human-review — 문단 지도 문구의 최종 국어 교사 확인 필요
- **Comprehension probe:** term-explanation, recovery-action

### 전이 전략

- **Before:** `근거 기록 / 다음 글에도 가져갈 생각`
- **After:** `다음 글에 써 볼 방법` → `중심 생각 찾기` → `문장 관계 살피기` → `근거로 말하기`
- **Target grade:** 초3–6
- **Learning intent preserved:** yes — 현재 6단계에서 익힌 중심·관계·근거를 다음 글에 옮김
- **Screen/state:** `수리 기록` 완료 / takeaway section / 정적 + DOM
- **Difficulty signals:** missing-recovery 보강, abstract-or-formal 완화
- **Curriculum accuracy:** human-review
- **Comprehension probe:** restatement

## 3. 보류 문구

다음 문구는 현재도 의미가 통하고 판정·버튼 테스트 계약과 연결되므로 이번 사이클에서 바꾸지 않습니다.

- `관련성 점검 완료`, `문단 시험하기`, `수리 완료 확인`: 기능 결과와 일치하며 기존 E2E·접근성 계약에 사용됨
- `중심 문장`, `근거`, `원인과 결과`, `주장과 근거`: 교과 핵심어이므로 쉬운 말로 삭제하지 않음
- 문장 fixture와 feedbackText: 국어 교사 검수 전까지 제품 진실로 보존하고 human-review로 남김

## 4. 검증 기록

- 후보 inventory는 61개 파일·1,047개 후보를 수집했으며, 테스트 코드·개발 문구가 섞이므로 실제 DOM과 분리해 해석했습니다.
- 입장·READ·TOPIC·ORDER·RELEVANCE·CONNECTOR·EXPLAIN·REPORT의 정상·오답·완료 상태를 실제 브라우저에서 확인했습니다.
- `선택됨`, `다시 확인해 볼까요?`, `함께 다시 볼 근거예요`, `수리 기록`의 상태 문구는 실제 DOM에 나타났습니다.
- VoiceOver는 검증하지 않았습니다. 키보드·DOM 의미·보이는 포커스는 자동 검사와 브라우저 기준으로 별도 확인합니다.

## 5. 개선 후 확인

- `수리 기록` 상단에 `다음 글에 써 볼 방법`, `중심 생각 찾기`, `문장 관계 살피기`, `근거로 말하기`가 실제 DOM과 375px 화면에 표시되었습니다.
- 완료 고지는 `국어 교사가 검수 중이에요`, `모든 글에 똑같이 맞는 것은 아니에요`, `글의 근거를 함께 살펴보세요`로 렌더링되었습니다.
- 6개 미션 완료 후 새 문구와 기존 기록·인쇄·재시작 버튼이 함께 유지되었습니다.
- 버튼명·핵심 교과어휘는 계약 보존을 위해 바꾸지 않았으며, 별도 국어 교사 검수 후 후속 판단합니다.
