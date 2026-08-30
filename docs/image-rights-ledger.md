# 이미지 권리 장부 (Image Rights Ledger)

생성 이미지 자산의 프롬프트, 생성일, 파일명, 사용 위치를 1:1로 기록합니다.
장부에 없는 생성 자산을 앱에 포함할 수 없고, 장부의 모든 항목은 실제 파일과 대응해야 합니다
( `tests/release/pages-assets.test.ts` 와 Task 7 테스트가 검사합니다).

## 자산 목록

| # | 파일명 | 사용 위치 | 생성 방식 | 생성일 | 사람 검수 |
|---|---|---|---|---|---|
| 1 | `src/assets/generated/paper-repair-workbench.webp` | 앱 배경(작업대 종이 질감) | 로컬 생성 스크립트(확장 가능한 벡터 → 래스터 변환). 이미지 생성 모델 프롬프트로 재생성할 수 있도록 아래 프롬프트를 보관 | 2026-08-28 | 대기(pending) |
| 2 | `src/assets/generated/repair-desk-atmosphere-v2.webp` | 앱 배경(교정지 여백 작업대 분위기) | 이미지 생성 모델 | 2026-08-30 | 대기(pending) |
| 3 | `src/assets/generated/mission-scenes-atlas-v2.webp` | 입구·미션 목록·수리 기록의 6개 장면 썸네일 | 이미지 생성 모델 | 2026-08-30 | 대기(pending) |
| 4 | `src/assets/generated/repair-tools-v2.webp` | 작업대 안내 영역의 수리 도구 장식 | 이미지 생성 모델 | 2026-08-30 | 대기(pending) |

## 생성 프롬프트 (재생성용)

> 밝은 크림색 종이 질감의 작업대 위에 문장 띠 카드와 화살표 연결 표식이 가늘게 흩어져 있는
> 수학적 배경 일러스트. 글자, 숫자, 인물, 로고 없음. 부드러운 파스텔 색(크림, 하늘색, 연두).
> 교실 게시물 배경으로 쓸 수 있을 만큼 단순하고 낮은 대비. 16:9, 상업적 이용 가능 자체 제작.

### `repair-desk-atmosphere-v2.webp`

> Warm ivory Korean elementary language-workbook correction desk atmosphere, viewed from above. A
> wooden pencil rests near the left edge, a small binder clip sits near the lower left, a coral
> correction tape tool is near the upper right, and a few blank paper strips rest along the right
> edge. Leave the center and upper middle mostly empty for real HTML content. Editorial classroom
> still life, quiet paper texture, muted ink navy and coral accents, soft low contrast, no readable
> text, no letters, no numbers, no logos, no people, no UI, no answer marks, no gradients. 16:9,
> original generated asset for a static educational web app.

### `mission-scenes-atlas-v2.webp`

> A 3x2 illustration atlas for a Korean elementary language-learning web app, used as six small
> decorative mission thumbnails. Panel 1 is a generic school flowerbed with soil and a seed;
> panel 2 is a wet playground with puddles and a covered gym-like shelter; panel 3 is two
> contrasting reading nooks; panel 4 is a plain reusable water bottle on an art-room shelf;
> panel 5 is a generic butterfly observation scene; panel 6 is a sunny playground with a shade
> shelter. Warm ivory paper, hand-inked editorial illustration, muted navy/coral/sage. No readable
> text, letters, numbers, logos, UI, scores, labels, answer marks, people, or faces.

### `repair-tools-v2.webp`

> A vertical decorative classroom paragraph-repair tool panel with a graphite pencil, coral
> correction tape, navy binder clip, magnifying glass, and blank ruled paper strips on warm ivory
> notebook paper. Keep the center quiet for real HTML content. Hand-inked editorial illustration,
> muted navy/coral/sage. No readable text, letters, numbers, logos, UI, scores, labels, answer
> marks, people, or faces.

## 권리 및 제약

- 모든 자산은 외부 핫링크 없이 동일 출처에서 제공합니다.
- 자산 안에 글자·정답·색상만으로 전달되는 정보가 없어야 합니다(장식 전용).
- 자산을 제거해도 모든 문장·근거·판정이 HTML/CSS로 그대로 완주됩니다.
- 사람 검수(맥락·편향·권리)는 교과 검수와 함께 진행하며, 대기 중인 자산은 배포 근거로 쓰지 않습니다.
- 기존 `paper-repair-workbench.webp`는 호환성과 롤백을 위해 보존하고, 새 배경은 리디자인 화면의 후보 자산으로 추가했습니다.
