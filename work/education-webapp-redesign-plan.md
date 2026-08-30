# 문단 흐름 수리소 전체 리디자인 계획

- **작성일:** 2026-08-30
- **상태:** 승인된 이미지 중심 후속 단계 구현 진행
- **범위:** 현재 저장소의 정적 React/Vite 학습 앱 전체 시각·상호작용 리디자인
- **이번 요청에서 제외:** 커밋, 푸시, GitHub Pages 배포, HVC 등록/동기화, VoiceOver 검증

## 1. 확인한 규칙과 선행 조건

### 프로젝트 규칙 우선순위

저장소에서 다음 파일을 확인했으나 발견되지 않았습니다.

1. `AGENTS.md`
2. `EDUCATION_DESIGN.md`
3. `design-system/MASTER.md`

따라서 이 세션에 제공된 `AGENTS.md` 지시와 기존 구현·테스트·문서의 기능 계약을 우선 적용합니다. 리디자인 전에 `PRODUCT.md`를 새로 추가하여 제품 사실을 시각 언어와 분리했습니다. 새 `design-system/MASTER.md`는 초기 감사와 검색 결과를 반영한 뒤 생성합니다.

### Stage 0 결과

다음 검사를 2026-08-30에 오프라인으로 실행했고 성공했습니다.

```text
python3 /Users/kimhongnyeon/.codex/skills/education-webapp-redesign/scripts/stage0_bootstrap.py \
  --manifest /Users/kimhongnyeon/.codex/skills/education-webapp-redesign/references/stage-0-resources.json \
  --mode check --scope user --offline \
  --project-root "/Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop" \
  --report "/Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop/work/education-webapp-redesign-stage0-report.md"
```

확인된 지원 리소스:

- `impeccable`: 사용 가능. source commit `b0594c72d18006b5865c70eb3a97e8b04064e600`, archive SHA `7b3fb0692e3a4cd9573734f75a40e74026052932c57face1aa1b080427e4386b`, Apache-2.0
- `ui-ux-pro-max`: 사용 가능. source commit `8bd29e775453ebcae52b6e6514fbf134df0c5770`, archive SHA `4516deaaafeacadc1c373b63c43fd580b2446f65cdc990a0e5f9a522cedf7b52`, MIT
- `redesign-existing-projects`: 사용 가능. source commit `ccbc15639c97057cbfcf32ecebc38ef716e4bb37`, archive SHA `aca57bda13d97d90e0229f55fd895e2492ae5ecf7aa59b52a89ccbce805f23e6`, MIT
- `imagegen`: Codex 제공 지원으로 사용 가능하며 별도 설치가 필요하지 않음

상세 결과는 [`education-webapp-redesign-stage0-report.md`](./education-webapp-redesign-stage0-report.md)에 보존합니다.

### 지원 스킬 적용 방식

- `education-webapp-redesign`: 전체 순서와 산출물 기준
- `impeccable`: 제품 진실, 기존 제품 보존, 방향성 시드, 초기 감사, 최종 휴리스틱 검토
- `ui-ux-pro-max`: 검색 기반 디자인 시스템과 UI 패턴 검토
- `redesign-existing-projects`: 기존 기능 계약을 보존하는 교체 설계
- `imagegen`: 프로그램 맥락에 맞는 장식 자산 생성
- `playwright` 및 Codex 인앱 브라우저: 실제 학습자 흐름·반응형·포커스의 별도 확인

Default 모드에서는 구조화된 디자인 선택 입력 도구가 노출되지 않았습니다. 따라서 이번 세션은 저장소의 제품 사실과 초기 감사에서 도출한 방향을 바탕으로 `code-led` 리디자인을 진행하며, 별도의 사용자 선호를 확인했다고 주장하지 않습니다. 생성 이미지는 UI 목업이 아니라 맥락을 보조하는 단일 장식 자산으로만 사용합니다.

## 2. 현재 제품 계약

| 항목 | 확인된 계약 |
|---|---|
| 대상 | 한국어 초등 3~6학년, 15~25분 활동 |
| 미션 | 정원·비·도서관·물병·나비·놀이터 6개 고정 미션 |
| 핵심 학습 | 중심 문장, 순서, 관련성, 연결 관계, 근거 설명 |
| 상태 | `useReducer` 기반 단계 전환, 이전 단계로 돌아가기, 재시도·유예 |
| 기록 | 첫 순서와 최종 순서, 선택 근거, 설명을 세션 중 표시 |
| 저장 | 서버·로그인·외부 요청·브라우저 저장 없음 |
| 접근성 | semantic labels, 키보드 조작, 포커스 이동, 글자 크게, reduced motion |
| 금지 | 점수·순위·광고·분석·다크 모드·학생용 음성 기능 |

기존 `src/domain`, `src/content`, `src/app/sessionReducer.ts`를 제품 진실의 핵심으로 보고, 리디자인은 화면 계층·정보 배치·조작 피드백을 개선하는 범위에서 진행합니다.

## 3. 초기 감사에서 해결할 문제

### P0 — 학습을 막을 수 있는 문제

- 현재까지 기능을 막는 P0는 확인되지 않았습니다.

### P1 — 이번 리디자인에서 우선 해결

1. 첫 화면이 880px의 좁은 중앙 열에 머물고 장식용 배경의 빈 카드·선이 실제 UI와 겹쳐, 학습 목적과 시작 행동이 약합니다.
2. 헤더와 입장 화면에 업데이트 내역 버튼이 중복되고, 브랜드·미션 시작·현재 학습 위치의 위계가 분산됩니다.
3. 단계 제목을 `scrollIntoView({ block: "start" })`로 이동할 때 제목이 뷰포트 상단에 붙거나 잘릴 수 있고, `.screen-title:focus`가 포커스 윤곽을 제거합니다.
4. 중앙 작업 단계의 현재 위치가 여섯 개 단계 칩에만 의존하며, 미션 진행과 작업 단계가 한 화면에서 충분히 분리되지 않습니다.
5. 순서 수리 화면은 각 행에 숫자 입력과 위·아래 버튼이 반복되어 좁은 화면에서 밀도가 높고, 문장을 어디로 옮기는지의 모델이 약합니다.
6. 피드백·근거·다음 행동이 같은 시각적 무게를 가져, 학생이 “읽고 판단 → 근거 확인 → 다음 단계”를 빠르게 파악하기 어렵습니다.

### P2 — 함께 정리할 품질 문제

1. 반응형 규칙이 보고서 열 배치 중심이고, 320/375px 작업 화면을 위한 명시적 간격·행동 영역 규칙이 부족합니다.
2. `min-height: 100vh`, raw color 두 곳, 장식 배경의 낮은 정보 가치가 현재 토큰 체계와 일관되지 않습니다.
3. 보고서가 여섯 개의 동일한 카드 벽처럼 보이며, 점수를 만들지 않으면서도 “무엇을 기록했는지” 요약하는 구조가 없습니다.
4. 현재 버튼은 기본·hover·focus는 있으나, 선택됨·성공·비활성·현재 작업의 상태 대비가 약합니다.

## 4. 시각 방향

### 선택 방향: “교실 편집 데스크”

제품의 핵심 은유를 추상적인 종이 배경이 아니라, 학습자가 실제로 문장 조각을 살펴보고 고치는 편집 작업대로 설정합니다.

구체적인 문화적·물리적 단서:

1. 한국 초등 국어 공책의 여백선과 단정한 필기 간격
2. 문장 조각을 놓는 편집 데스크와 종이 트레이
3. 교정용 수정테이프와 연필의 작은 도구성
4. 도서관 대출 카드처럼 한눈에 보이는 단계 기록
5. 교정 부호와 화살표에서 가져온 순서 이동 언어
6. 교실 게시판의 색상 탭을 연상시키는 미션 라벨
7. 정답 스탬프 대신 근거를 체크하는 검토 표식

색상은 따뜻한 아이보리 바탕, 짙은 잉크 네이비, 한정된 코랄 행동색, 차분한 세이지 성공색을 사용합니다. 그라디언트·네온·보라색 AI풍 장식·가짜 UI 카드가 떠 있는 배경은 사용하지 않습니다. 정보 구조는 CSS와 실제 DOM으로 만들고, 이미지는 분위기를 보조할 뿐 조작 요소를 흉내 내지 않게 합니다.

### 핵심 화면 구조

```text
입장
┌─ 브랜드 / 글자 크게 / 업데이트 내역 ─────────────────────┐
│ 오늘의 수리 목표              │  6개 미션 작업 카드        │
│ 문단을 읽고 근거로 고치기      │  현재 미션 / 관계 / 길이     │
│ [문단 수리 시작]               │  [미션 목록]                │
└──────────────────────────────────────────────────────────┘

작업대
┌─ 미션 제목 / 2 / 6 / 관계 ──────────────────────────────┐
│ 단계 내비게이션: 읽기 → 중심 → 순서 → 관련성 → 연결 → 설명 │
├──────────────────────┬──────────────────────────────────┤
│ 현재 작업 안내         │ 실제 문장·선택·근거 작업면            │
│ 왜 하는지 / 힌트        │ [현재 단계의 핵심 행동]               │
└──────────────────────┴──────────────────────────────────┘

기록
┌─ 이번 세션 요약: 6개 미션 / 첫 판단과 최종 수리 기록 ───────┐
│ 미션별 첫 순서 → 최종 순서 / 관계 / 근거 / 다음 수업 힌트      │
└──────────────────────────────────────────────────────────┘
```

### Impeccable 방향성 시드 기록

시드 실행 결과는 `key: 1fb68476`, `mode: operate`, 지정 index `3`이었습니다. 지정 후보를 무시하지 않기 위해 다음 일곱 가지 grounded direction을 만들고 세 번째를 구현 방향으로 사용합니다.

1. **교실 편집 데스크:** 공책 여백선·문장 조각·수정테이프·연필을 작업대와 단계 rail로 번역한다.
2. **도서관 대출 카드 서가:** 미션을 대출 카드처럼 세우고, 완료 카드를 왼쪽에서 오른쪽으로 쌓아 세션의 이동을 읽게 한다.
3. **교정지 여백 작업대:** 교정 부호, 번호 스탬프, 문장 조각, 근거 체크 표시를 하나의 여백 규칙으로 묶는다. 현재 작업은 잉크 네이비 선, 핵심 행동은 제한된 코랄, 성공 근거는 세이지로 표시한다.
4. **학급 게시판 편집 코너:** 색상 탭과 핀으로 단계와 상태를 구분하고, 게시판의 고정된 제목 띠로 현재 미션을 고정한다.
5. **문구점 수리 키트:** 수정테이프·클립·연필의 도구성을 사용하되 실제 조작은 카드/버튼/입력으로 유지한다.
6. **접이식 시험지 폴더:** 읽기·판단·설명 결과를 폴더의 세 구획으로 분리하고 모바일에서는 한 구획씩 펼친다.
7. **노트 여백 지도:** 중심 문장과 뒷받침 문장을 여백의 선과 화살표로 연결해 순서·관련성을 공간적으로 보여 준다.

세 번째 후보를 선택한 이유는 초등 국어의 “문장을 고쳐 읽고 근거를 표시한다”는 제품 목적을 가장 직접적으로 드러내면서, 입장·작업·기록 화면 모두에 같은 문법을 확장할 수 있기 때문입니다. 챌린저 융합 판단은 정확히 두 축으로 평가했습니다.

| 챌린저 | audience identification | product clarity | verdict | 유지/보강 판단 |
|---|---|---|---|---|
| pocket airline timetable / tinted glass slide rack | competitive | wins | competitive | 고정 tick rail의 위치 표시 규율만 차용하고, 항공 코드·유리 질감·기울어진 랙은 사용하지 않음 |
| variety-show telop caption field | wins | declined | competitive | 강조 색의 감정적 단계는 흥미롭지만 학습 근거를 희화화할 수 있어, 선택 상태의 대비 규칙만 제한적으로 사용 |
| live ASCII scene render | declined | declined | declined | 단일 모노스페이스 격자의 집중력 규율이 부족하므로, 작업대 방향에 “한 행 한 문장”의 밀도 규율을 기부해 보강 |
| broadcast teletext magazine | competitive | competitive | competitive | 고정 셀의 현재 위치·상태 표시는 유용하지만, 검은 화면·깜빡임·숫자 주소는 제품 가독성과 충돌 |
| volcanic island mesophotic deep dive | declined | competitive | competitive | 하나의 세로 경로가 단계 topology를 명확히 하는 점만 차용하고, 깊이/해양 은유는 사용하지 않음 |
| silk drawcord transforming cape | declined | declined | declined | 단계별로 “당겨서 상태를 바꾼다”는 단일 조작 규율을, 선택 후 다음 CTA가 한 가지인 구조로 기부 |

**지정 방향의 최종 시스템:** 교정지 여백을 주 표면으로 삼고, 공책 여백선은 정보 정렬, 문장 조각은 opaque 작업 카드, 교정 부호는 순서 이동과 근거 상태, 번호 스탬프는 현재 미션/단계, 수정테이프는 보관함·보류 상태를 의미하게 합니다. 이 시스템은 색상 테마가 아니라 navigation, dense content, interaction state, report까지 유지되는 topology로 구현합니다.

## 5. 변경 범위와 보존 범위

### 보존

- `src/domain/types.ts`, `src/domain/paragraphEvaluator.ts`, `src/content/missions.ts`의 타입·판정·고정 콘텐츠
- `sessionReducer`의 단계 전환·재시도·유예 의미
- 기존 테스트가 검증하는 버튼 이름, ARIA label, 미션 수, 개인정보 경계
- 원본 이미지 `src/assets/generated/paper-repair-workbench.webp` — 교체하더라도 삭제하지 않음

### 변경 후보

- `src/app/App.tsx`: skip link, main landmark, 새 shell/header/scroll behavior
- `src/features/paragraph-repair/EntranceScreen.tsx`: hero·미션 rail·주요 행동 계층
- `src/features/paragraph-repair/ParagraphWorkbench.tsx`: 미션 헤더·단계 내비게이션·작업면 구조
- `src/components/ProgressSteps.tsx`: 단계별 숫자·현재 상태·모바일 구조
- `src/components/ActionButton.tsx`: 현재 핵심 행동 pulse/상태 클래스 보존
- `src/features/paragraph-repair/steps/*.tsx`: 작업 영역의 그룹·도움말·버튼 위치 정리, 기능 계약 보존
- `src/features/paragraph-repair/LearningReport.tsx`: 세션 요약과 미션 기록 구조
- `src/styles/tokens.css`, `src/styles/app.css`, `src/styles/screens.css`, `src/styles/motion.css`: 새 디자인 토큰·반응형·포커스·상태 스타일
- `src/update/updateHistory.ts`: 2026-08-30 리디자인 항목 추가
- `src/assets/assetManifest.ts`, `docs/image-rights-ledger.md`: 새 생성 자산 원장과 원본 보존 기록
- 관련 테스트: 새 landmark/asset/pulse 계약만 추가·조정하고 제품 기능 테스트는 유지

파일은 500줄 미만을 유지하고, 기존 기능 로직을 화면 파일에 복사하지 않습니다.

## 6. TDD 및 구현 순서

1. [`education-webapp-redesign-audit.md`](./education-webapp-redesign-audit.md) 작성으로 초기 UI·기술 감사 근거를 고정한다.
2. Impeccable 방향성 시드 실행 후 방향 선택 근거를 기록한다.
3. `ui-ux-pro-max` 검색을 실행하고 `design-system/MASTER.md`에 확정 토큰·레이아웃·컴포넌트 규칙을 기록한다.
4. `craft-floor.md`와 `asset-safety.md`를 UI/이미지 작업 직전에 다시 읽는다.
5. 새 구조 테스트를 먼저 추가한다: skip link/main id, 핵심 행동 pulse, 새 자산 사용·원본 보존, 현재 단계 표시.
6. 테스트가 새 계약에서 실패하는 것을 확인한 뒤 컴포넌트·CSS를 구현한다.
7. 생성 이미지를 새 버전 파일로 저장하고 원본은 보존한다. `assetManifest`, rights ledger, 자산 보고서를 함께 갱신한다.
8. 단위/a11y/privacy/release/line/build 검사를 실행한다.
9. Codex 인앱 브라우저에서 새로고침 후 실제 학습자 흐름을 확인한다. 브라우저 자동화와 수동 확인을 별도 증거로 보고한다.
10. Impeccable detector 및 최종 critique를 실행하고 최종 보고서를 작성한다.

## 7. 검증 계획과 기대 결과

### 자동 검사

```text
npm run lint
npm run typecheck
npm run test:run
npm run test:a11y
npm run check:lines
npm run build
npm run test:release
npm run test:e2e
```

기대 결과는 lint/typecheck/unit/a11y/line/build/release가 통과하고, E2E는 환경 문제와 제품 assertion을 구분하는 것입니다. 기준 실행에서 macOS Chromium이 `mach_port_rendezvous`/`SIGTRAP`으로 시작하지 못했으므로 같은 방식의 반복 시도는 하지 않고, 인앱 브라우저 수동 흐름과 저장소 CI용 E2E 상태를 별도로 기록합니다.

### 브라우저·수동 확인

- 폭 320, 375, 768, 1280px: 가로 스크롤 없음, 버튼/입력 터치 영역, 문장 읽기 순서, 보고서 열 배치
- 키보드: skip link, 시작, 판단 버튼, 단계 핵심 행동, 순서 위·아래 이동, 뒤로 가기, 업데이트 대화상자 Escape/포커스 복귀
- 단계 전환: 제목이 잘리지 않고 포커스가 보이며 현재 미션·현재 단계·다음 행동이 보임
- reduced motion: `gi-pulse` 애니메이션 제거, 필수 행동의 텍스트 표식 유지, 단계 스크롤 즉시 이동
- 라이트 모드 고정: 다크 모드 분기와 외부 네트워크·저장 호출 없음
- 실제 학습자 경로: 시작 → 6개 미션 완료 → 보고서 → 새 세션. 정답/오답·재시도·유예·뒤로 가기 흐름을 일부러 포함
- VoiceOver는 프로젝트 범위 밖으로 제외하며, 키보드·DOM 이름·포커스 이동으로 확인

## 8. 롤백과 안전선

- 변경 전 기준은 현재 `main`의 `cf8b8bd docs: record paragraph-flow-repair-shop release evidence`와 깨끗한 소스 상태(`work/`만 신규)다.
- 변경 파일 목록과 `git diff --stat`를 단계별로 기록한다.
- 문제가 생기면 이번 세션에서 만든 파일과 수정한 파일만 명시적으로 되돌리고, 사용자 작업을 보존하기 위해 broad reset/checkout은 사용하지 않는다.
- 원본 생성 이미지와 원본 자산 원장 행은 삭제하지 않는다.
- 구현 범위를 넘어서는 콘텐츠 승인·배포·HVC·유료 서명·외부 계정 작업은 수행하지 않는다.

## 9. 구현 결과 기록

계획의 구현 순서에 따라 제품 사실을 먼저 고정한 뒤 화면 계층과 스타일을 교체했습니다.

- 실제 저장소가 Next.js가 아닌 Vite React/TypeScript 앱임을 확인하고, 현재 실행 구조를 유지했습니다.
- 입장 화면은 `교정지 여백 작업대` 방향의 2열 구조로 재구성했습니다. 첫 화면에서 학습 목적, 실제 첫 미션, 6개 미션 목록, 시작 행동이 한 번에 읽히도록 했고 320px에서도 시작 CTA가 첫 viewport 안에 남도록 순서를 조정했습니다.
- 작업 화면은 미션 번호·관계·6단계 진행·현재 작업 안내·작업면을 분리했습니다. 단계 제목 포커스, `scroll-margin-top`, reduced-motion 스크롤, skip link/main landmark를 적용했습니다.
- 순서 작업의 위·아래 조작을 문장 카드 안의 두 번째 행으로 묶어 작은 폭의 가로 넘침을 제거했습니다. 선택·성공·보류·다음 행동의 대비를 상태별로 강화했습니다.
- 보고서는 점수·순위 없이 `6개 미션`, 처음 판단, 최종 수리, 근거 기록을 요약하는 구조로 정리했습니다.
- `AmbientToolkit`과 `repair-desk-atmosphere-v2.webp`를 추가했지만 이미지·중간 plate는 모두 장식 전용이며 실제 콘텐츠·판정·정보를 담지 않습니다. 기존 배경과 PNG 원본은 롤백을 위해 보존했습니다.
- 모든 TS/TSX/CSS 파일은 500줄 미만이며, `gi-pulse`는 단계별 현재 핵심 CTA에만 적용하고 reduced-motion에서 애니메이션을 제거합니다.
- 최종 검사 결과와 남은 사람 검수 항목은 [`education-webapp-redesign-report.md`](./education-webapp-redesign-report.md)에 기록했습니다.

Impeccable의 approved visual comp는 문구·미션 라벨·레이아웃 topology가 합성 placeholder였으므로, 실제 제품 콘텐츠를 placeholder로 바꾸지 않았습니다. 따라서 comps/spec/plates 단계는 통과했지만 hero fidelity 단계는 `48.6%`에서 열어 둔 상태이며, 제품 진실에 맞춘 새 comp가 후속 작업입니다. 이 차이를 숨기거나 강제로 통과 처리하지 않습니다.

## 10. 승인된 이미지 중심 후속 단계

2026-08-30 사용자 승인에 따라 첨부 레퍼런스의 시각 언어를 실제 제품 맥락에 맞는 이미지 레이어로 확장합니다. 첨부 이미지는 참고용이며, 이미지 안의 placeholder 문구·점수·레벨·아바타·정답 표식은 구현 요구사항이 아닙니다.

- `mission-scenes-atlas-v2.webp`: 실제 고정 미션 6개(화단 씨앗 심기, 젖은 운동장, 두 독서 공간 비교, 물병 찾기, 나비 관찰, 놀이 공간 제안)를 3×2 장면 아틀라스로 표현합니다.
- `repair-tools-v2.webp`: 연필·수정테이프·클립·문장지를 하나의 낮은 대비 도구 이미지로 표현합니다.
- 입구 미션 카드와 작업대 주변에 장면/도구 이미지를 배치하되, 미션명·관계·문장·상태·조작은 실제 DOM 텍스트와 버튼으로 유지합니다.
- 이미지는 일반 개념·장식 자산으로 분류하며, 빈 alt/`aria-hidden`을 사용합니다. 제거해도 학습 흐름과 판정이 완주되어야 합니다.
- 생성 결과에 읽을 수 있는 문자, 수치, 로고, 워터마크, 실제 인물·기관·장소의 사실적 재현이 포함되면 폐기합니다.
- 수용 기준은 1280px에서 이미지가 작업대 분위기를 강화하고, 375/320px에서 텍스트·버튼·문장 카드보다 앞서지 않으며, 가로 overflow와 네트워크 요청이 없는 것입니다.
- 원본 생성 파일은 보존하고 WebP 버전 파일을 추가합니다. 자산 원장·asset manifest·회귀 테스트·최종 보고서를 함께 갱신합니다.

### 실행 결과

- `mission-scenes-atlas-v2.webp`와 `repair-tools-v2.webp`를 생성하고, 원본 PNG는 `assets/generated-source/`에 보존했습니다.
- 입구의 첫 미션 보드와 6개 미션 목록, 작업대의 현재 미션 상태·도구 영역, 수리 기록의 6개 미션 헤더에 이미지 레이어를 연결했습니다.
- 이미지 레이어는 `aria-hidden="true"`와 `pointer-events: none`을 사용하며, 미션명·문장·판정·버튼·근거는 실제 DOM에 남겼습니다.
- 관련 자산 장부, manifest, 입구 회귀 테스트, 업데이트 내역을 갱신했습니다.
- 자동 검사와 로컬 인앱 브라우저의 1280/390/320px 및 6개 미션 완료 흐름을 확인했습니다. 후속 변경은 `1f7f020`으로 커밋·푸시했고, CI와 GitHub Pages 배포 성공 및 공개 URL 자산·학습자 경로 검증까지 완료했습니다.
