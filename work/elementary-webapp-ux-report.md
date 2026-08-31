# 문단 흐름 수리소 초등 UX 개선 최종 보고

- **모드:** `full`
- **작성일:** 2026-08-31
- **대상:** `/Volumes/ External Drive 256G/Dev2/codex/paragraph-flow-repair-shop`
- **주 페르소나:** 초3–4 준호, 보조 관점 초5–6 서윤
- **Stage 0:** `ready`
- **사용한 핵심 경로:** `elementary-webapp-ux-orchestrator` + Codex 인앱 브라우저
- **범위 밖:** VoiceOver, 실제 학생·교사 연구, 커밋·푸시·배포

## 결론

실제 로컬 화면을 기준으로 모바일 과제 위계를 개선하고, 완료 후 다음 글에 적용할 읽기 전략을 추가했습니다. 기준선 83점에서 91점으로 상승했으며, P0/P1 없이 핵심 경로·반응형·키보드·전이 게이트를 확인해 최종 판정은 `pass`입니다.

## 발견·개선

| 이슈 | 개선 |
|---|---|
| EDU-UX-001 / P2: 320/375px에서 수리 메모와 도구 장식이 실제 과제보다 먼저 쌓임 | `ParagraphWorkbench`의 DOM을 task-first로 정리하고, 데스크톱은 CSS grid로 guide 왼쪽을 유지. 모바일은 task → guide 순서 |
| EDU-UX-002 / P2: 보고서가 다음 글에 적용할 방법을 구체적으로 말하지 않음 | `다음 글에 써 볼 방법` 카드에 `중심 생각 찾기 → 문장 관계 살피기 → 근거로 말하기` 추가 |
| EDU-UX-003 / P2: 완료 범위 고지가 성인·시스템 문장에 가까움 | 교사 검수 상태와 “모든 글에 똑같이 맞지 않음” 경계를 아동 문장으로 변환 |

기존 6개 미션, evaluator/reducer, 오답·유예·보관함 회복, `gi-pulse`, 저장·외부 요청 없음, 이미지 장식 경계는 그대로 유지했습니다. 새 이미지는 생성하지 않았습니다.

## 실제 브라우저 증거

- **320×800:** task top 566px, guide top 1,434px, 첫 판단 버튼 top 1,228px. 기준선은 guide top 566px/task top 899px/첫 판단 버튼 top 1,561px였습니다.
- **375×812:** task top 540px, guide top 1,355px, 첫 판단 버튼 top 1,148px. 두 폭 모두 `scrollWidth === clientWidth`.
- **1280×900:** task-first DOM을 유지하면서 guide는 왼쪽 39px·폭 320px, task는 오른쪽 360px·폭 866px로 렌더링.
- **전체 경로:** 입장 → 6개 미션 → `수리 기록`을 같은 조작 시나리오로 재실행. 전이 카드는 보고서 첫 viewport(top 416px, height 440px)에 표시.
- **업데이트 내역:** `2026-08-31 — 모바일에서 실제 과제를 먼저 보여 주고 다음 글에 적용할 읽기 전략을 추가` 확인.
- **콘솔:** 개선 전·후 로컬 브라우저 오류 없음.

## 자동 검증

| 검사 | 결과 |
|---|---|
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm run test:run` | 14개 파일 / 111개 테스트 통과 |
| `npm run test:a11y` | 2개 테스트 통과 |
| `npm run check:lines` | 통과, TS·TSX·CSS 500줄 미만 |
| `npm run build` | 통과 |
| `npm run test:release` | 4개 테스트 통과 |
| `npm run test:e2e` | 9개 테스트 통과 |

## 점수·게이트

| 영역 | 기준선 | 최종 |
|---|---:|---:|
| 학습 목표·과제 명료성 | 13/15 | 14/15 |
| 언어적 가독성·인지부하 | 16/20 | 18/20 |
| 화면 구조·행동 위계 | 8/12 | 11/12 |
| 피드백·오류 회복 | 11/13 | 11/13 |
| 시각적 가독성 | 9/10 | 9/10 |
| 키보드·의미·기본 접근성 | 9/10 | 9/10 |
| 반응형 학습 흐름 | 7/10 | 9/10 |
| 런타임 안정성 | 5/5 | 5/5 |
| 맥락적 시각자료·자산 안전 | 5/5 | 5/5 |
| **합계** | **83/100** | **91/100** |

- 해결되지 않은 P0/P1: 0개
- 모바일 가로 넘침·핵심 경로·키보드·기본 접근성·학습 takeaway: 통과
- 시뮬레이션 게이트: N/A (`not-needed`)
- 인쇄·재시작·기존 기록: 유지 및 자동 테스트 통과

## 산출물

- [`elementary-webapp-ux-bootstrap.md`](./elementary-webapp-ux-bootstrap.md): Stage 0
- [`elementary-webapp-ux-audit.md`](./elementary-webapp-ux-audit.md): 기준선·최종 감사·점수
- [`elementary-webapp-ux-plan.md`](./elementary-webapp-ux-plan.md): 구현 계획
- [`elementary-webapp-ux-language-audit.md`](./elementary-webapp-ux-language-audit.md): 상태별 문구 장부
- [`elementary-webapp-ux-simulation-decision.md`](./elementary-webapp-ux-simulation-decision.md): 시뮬레이션 결정

## 사람 검수와 릴리스 경계

- 문단 fixture·판정의 국어 교사 검수는 여전히 `human-review`입니다.
- 생성 이미지의 맥락·권리·편향 검수, 실제 학생 이해도, Safari·물리 기기 사용성은 별도 확인이 필요합니다.
- VoiceOver는 프로젝트 규칙에 따라 구현·검증하지 않았습니다.
- HVC 확인은 [로컬 학습 앱](http://127.0.0.1:4175/)에서 할 수 있습니다.
- 이번 요청은 개선·점검 범위로 처리했으며 커밋·푸시·배포와 공개 URL 갱신은 실행하지 않았습니다.
