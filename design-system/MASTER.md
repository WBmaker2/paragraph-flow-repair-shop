# 문단 흐름 수리소 디자인 시스템

- **작성일:** 2026-08-30
- **제품 방향:** 교정지 여백 작업대
- **적용 범위:** 입장, 6단계 작업대, 세션 기록, 대화상자, 업데이트 내역
- **우선순위:** `PRODUCT.md`의 제품 사실과 기능 계약이 이 문서보다 우선한다.

## 검색 결과와 제품별 결정

`ui-ux-pro-max`의 프로젝트 검색은 `Language Learning App`, `Claymorphism`, indigo/green 색상, 외부 Google Font, `Hero + Testimonials + CTA` 패턴을 추천했습니다. 별도 검색에서는 `e-ink-paper`, `editorial-grid-magazine`, semantic HTML, `getByRole`/`getByLabelText`, multi-step progress, visible focus를 확인했습니다.

제품 계약에 맞지 않는 claymorphism, testimonials·사회적 증거, 점수성 지표, 외부 폰트와 보라색/indigo 기본값은 채택하지 않습니다. 대신 컴프 측정값과 저장소의 라이트 모드·무외부요청 계약을 바탕으로 다음 규칙을 확정합니다.

## Visual grammar

### 색상

| 토큰 | 값 | 사용 |
|---|---|---|
| `--color-bg` | `#f7f6ea` | 전체 종이 바탕 |
| `--color-paper` | `#fffdf7` | 읽기·작업 표면 |
| `--color-paper-soft` | `#f1ecdf` | 보조 트레이·비활성 면 |
| `--color-ink` | `#0e203a` | 제목·본문·주요 rule |
| `--color-ink-soft` | `#39485b` | 보조 설명, 최소 4.5:1 확인 |
| `--color-line` | `#c6c2bd` | 구분선·카드 경계 |
| `--color-margin` | `#d86a58` | 교정지 여백선·행동 강조 |
| `--color-action` | `#d9584c` | 현재 단계의 단일 주요 CTA |
| `--color-action-ink` | `#fffaf2` | 행동색 위 텍스트 |
| `--color-success` | `#477255` | 근거 확인·완료 상태 |
| `--color-warning` | `#9a5b2f` | 다시 살펴볼 근거 |
| `--color-focus` | `#0e203a` | 3:1 이상 visible focus ring |

색상은 의미와 함께 텍스트·아이콘·경계로 중복 표현합니다. 그라디언트, dark mode, 네온, 색상만으로 정답을 구분하는 패턴은 사용하지 않습니다.

### 타이포그래피

- 기본 글꼴은 외부 요청 없이 `"Apple SD Gothic Neo", Pretendard, "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif`를 사용합니다.
- `font-match`의 승인 컴프 측정은 brand cap 33.7px / wide medium, headline cap 30.9px / wide regular를 제시했고, 브라우저 없는 rank는 `Belgrano`를 nearest catalog face로 반환했습니다. Korean glyph 지원과 무외부요청 계약 때문에 `Belgrano`를 설치하거나 import하지 않고, 기존 로컬 Korean stack으로 비교 가능한 크기·폭·무게를 맞춥니다.
- 본문은 17px 이상, `line-height: 1.65`, 한 문단 measure는 65~75ch를 목표로 합니다.
- 제목은 `letter-spacing: -0.03em` 이내, 단계 라벨은 짧고 굵게, 숫자는 tabular 숫자를 사용합니다.
- 제목 위에 장식용 kicker를 반복하지 않습니다. 제품 계약상 꼭 필요한 “현재 작업”/“목표” 라벨만 정보 구조로 사용합니다.

### 표면과 깊이

- 교정지의 얇은 붉은 여백선과 잉크 네이비 rule을 공통 정렬 기준으로 사용합니다.
- 작업 표면은 불투명한 paper panel이며, 얕은 `0 10px 24px rgba(14, 32, 58, .08)` 수준의 offset+blur shadow만 사용합니다.
- wide shadow와 1px border를 모든 카드에 겹쳐 쓰지 않습니다. 정보 그룹은 border, 떠 있는 dialog는 shadow로 역할을 나눕니다.
- radius는 14~18px, 작은 상태표시만 pill을 사용합니다.
- comp의 pencil, correction tape, binder clip, ruled paper는 ambient tool cue입니다. 학습 내용·정답·버튼처럼 보이는 가짜 장식은 만들지 않습니다.

## Layout contract

- 전체 shell은 `max-width: 1180px`, `padding-inline: clamp(16px, 4vw, 56px)`로 둡니다.
- 입장 화면은 넓은 화면에서 `minmax(0, .88fr) minmax(360px, 1.12fr)` 2열, 작은 폭에서는 한 열로 흐릅니다.
- 작업대는 `단계 내비게이션 → 미션 헤더 → 현재 작업 안내/작업면` 순서를 지킵니다.
- 기록 화면은 세션 요약을 먼저 보이고 미션 기록을 그 뒤에 둡니다. 여섯 카드가 동일한 벽이 되지 않도록 기록의 핵심 근거를 먼저 읽게 합니다.
- 고정 navigation을 사용하지 않으며, 제목과 주요 조작에는 `scroll-margin-top`을 둡니다.
- 320px에서도 `document.documentElement.scrollWidth <= clientWidth`를 유지하고, 줄바꿈·세로 조작·터치 영역을 우선합니다.

## Components and states

- **Primary action:** 현재 단계의 핵심 제출/진행 버튼 하나만 coral solid. 준비된 순간에만 `gi-pulse`; disabled는 pulse하지 않습니다.
- **Secondary action:** white/soft paper surface + ink border. Back, retry, defer처럼 위험도가 낮은 행동에 사용합니다.
- **Choice:** native button, `aria-pressed` 또는 `aria-selected`와 visible selected state를 함께 사용합니다.
- **Sentence strip:** 번호 gutter, 읽기 가능한 body measure, 선택/이동 조작의 명시적 group label.
- **Feedback:** `판정 → 근거 → 다음 행동` 3층. success/warning은 색상만이 아니라 제목·상태 문구로 전달합니다.
- **Progress:** 미션 위치 `n / 6`과 현재 작업 단계 6개를 동시에 노출합니다. 완료·현재·예정은 text/state attribute와 색상으로 중복 표현합니다.
- **Dialog:** 정말로 세션 초기화나 기록 확인이 필요한 경우에만 사용하고, Escape·focus restore·visible focus를 유지합니다.

## Motion and browser surfaces

- authored motion은 현재 CTA의 `gi-pulse`와 짧은 단계 전환 정도로 제한합니다. 모든 카드가 같은 entrance animation을 하지 않습니다.
- `@media (prefers-reduced-motion: reduce)`에서는 animation/transition을 제거하고, CTA의 의미는 `필수` 텍스트 표식으로 유지합니다.
- 선택 영역은 잉크/보조 배경, caret은 ink, focus ring은 3px solid ink + offset으로 테마화합니다.
- hover는 색·border·shadow 변화만 사용하고 layout shift를 만들지 않습니다. 모든 clickable 요소는 `cursor: pointer`를 가집니다.

## Asset and integrity rules

- 원본 `src/assets/generated/paper-repair-workbench.webp`는 보존합니다.
- 새 생성 자산은 버전 파일·자산 원장·빈 alt 또는 학습 맥락 alt를 함께 가집니다.
- asset는 UI text, 숫자, 정답, logo, 학교·기관 표식을 렌더링하지 않습니다.
- 페이지 구조·copy·controls는 semantic DOM으로 만들며, 이미지에 핵심 텍스트나 조작을 rasterize하지 않습니다.

## Verification checklist

- [ ] 320 / 375 / 768 / 1024 / 1280px에서 가로 overflow 없음
- [ ] skip link, heading focus, keyboard-only flow, dialog focus restore
- [ ] 선택/성공/오답/보류/비활성/빈 상태의 문구·색·경계 확인
- [ ] `gi-pulse`는 현재 핵심 행동에만 적용되고 reduced motion에서 제거됨
- [ ] no `prefers-color-scheme: dark`, no network/storage/cookie behavior
- [ ] 실제 6개 미션 경로와 보고서에서 제품 copy/정답 계약 유지
- [ ] VoiceOver는 제품 범위 밖으로 제외하며, DOM name·keyboard·focus evidence만 보고
