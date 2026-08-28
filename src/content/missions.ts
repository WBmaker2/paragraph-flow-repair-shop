import type {
  MissionId,
  ParagraphMission,
  Relation,
} from "../domain/types";
import { assertContentValid } from "./validateContent";

/**
 * 계획 문서(2026-08-28) §4.1 고정 문장 fixture. 문장 텍스트는 원문 그대로이며,
 * 국어 교사 검수 전까지 reviewStatus는 pending으로 유지한다.
 */
export const missions: readonly ParagraphMission[] = [
  {
    id: "paragraph-garden-01",
    relation: "sequence",
    sentences: [
      { id: "G1", text: "우리 반은 화단에 씨앗을 심었습니다.", roles: ["topic"] },
      { id: "G2", text: "먼저 흙을 고르게 다듬었습니다.", roles: ["support"] },
      { id: "G3", text: "작은 구멍마다 씨앗을 넣었습니다.", roles: ["support"] },
      { id: "G4", text: "씨앗 사이에 이름표도 꽂았습니다.", roles: ["support"] },
      { id: "G5", text: "마지막으로 흙을 덮고 물을 주었습니다.", roles: ["support", "closing"] },
      { id: "GX", text: "오늘 급식에는 국수가 나왔습니다.", roles: ["off-topic"] },
    ],
    topicSentenceIds: ["G1"],
    precedencePairs: [
      { beforeId: "G1", afterId: "G2", reasonKey: "garden-01.g1-first" },
      { beforeId: "G2", afterId: "G3", reasonKey: "garden-01.g2-before-g3" },
      { beforeId: "G2", afterId: "G4", reasonKey: "garden-01.g2-before-g4" },
      { beforeId: "G3", afterId: "G5", reasonKey: "garden-01.g3-before-g5" },
      { beforeId: "G4", afterId: "G5", reasonKey: "garden-01.g4-before-g5" },
    ],
    acceptedOrderIds: ["G1-G2-G3-G4-G5", "G1-G2-G4-G3-G5"],
    offTopicSentenceIds: ["GX"],
    connectorOptions: [
      { id: "garden-01.conn-first", text: "먼저", relations: ["sequence"] },
      { id: "garden-01.conn-next", text: "그다음", relations: ["sequence"] },
      { id: "garden-01.conn-therefore", text: "그래서", relations: ["cause-effect"] },
      { id: "garden-01.conn-but", text: "하지만", relations: ["compare"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성. 실제 학급 사건·인물·장소가 아님.",
    reviewStatus: "pending",
    misconceptionGuard:
      "시간 낱말(먼저, 그다음, 마지막으로)을 단서로 삼되, 급식처럼 화단과 상관없는 문장까지 순서에 넣지 않는다.",
  },
  {
    id: "paragraph-rain-02",
    relation: "cause-effect",
    sentences: [
      { id: "R1", text: "비가 온 뒤 운동장 모습이 달라졌습니다.", roles: ["topic"] },
      { id: "R2", text: "밤새 비가 많이 왔습니다.", roles: ["support"] },
      { id: "R3", text: "운동장 바닥이 젖었습니다.", roles: ["support"] },
      { id: "R4", text: "그래서 체육 수업은 체육관에서 했습니다.", roles: ["support", "closing"] },
      { id: "RX", text: "새 우산은 노란색이었습니다.", roles: ["off-topic"] },
    ],
    topicSentenceIds: ["R1"],
    precedencePairs: [
      { beforeId: "R1", afterId: "R2", reasonKey: "rain-02.r1-first" },
      { beforeId: "R1", afterId: "R3", reasonKey: "rain-02.r1-before-r3" },
      { beforeId: "R1", afterId: "R4", reasonKey: "rain-02.r1-before-r4" },
      { beforeId: "R2", afterId: "R3", reasonKey: "rain-02.r2-before-r3" },
      { beforeId: "R3", afterId: "R4", reasonKey: "rain-02.r3-before-r4" },
    ],
    acceptedOrderIds: ["R1-R2-R3-R4"],
    offTopicSentenceIds: ["RX"],
    connectorOptions: [
      { id: "rain-02.conn-therefore", text: "그래서", relations: ["cause-effect"] },
      { id: "rain-02.conn-result", text: "그 결과", relations: ["cause-effect"] },
      { id: "rain-02.conn-anyway", text: "그런데", relations: ["compare"] },
      { id: "rain-02.conn-first", text: "먼저", relations: ["sequence"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성. 실제 학교 사건이 아님.",
    reviewStatus: "pending",
    misconceptionGuard:
      "원인(비가 옴)을 결과(바닥이 젖음)보다 나중에 놓아 인과 관계를 뒤집지 않는다.",
  },
  {
    id: "paragraph-library-03",
    relation: "compare",
    sentences: [
      { id: "L1", text: "도서관에는 책을 읽는 두 공간이 있습니다.", roles: ["topic"] },
      { id: "L2", text: "창가 공간은 햇빛이 밝게 들어옵니다.", roles: ["support"] },
      { id: "L3", text: "안쪽 공간은 조명이 부드럽습니다.", roles: ["support"] },
      { id: "L4", text: "창가 쪽은 대화 소리가 조금 들립니다.", roles: ["support"] },
      { id: "L5", text: "안쪽 공간은 더 조용합니다.", roles: ["support", "closing"] },
    ],
    topicSentenceIds: ["L1"],
    precedencePairs: [
      { beforeId: "L1", afterId: "L2", reasonKey: "library-03.l1-before-l2" },
      { beforeId: "L1", afterId: "L3", reasonKey: "library-03.l1-before-l3" },
      { beforeId: "L1", afterId: "L4", reasonKey: "library-03.l1-before-l4" },
      { beforeId: "L1", afterId: "L5", reasonKey: "library-03.l1-before-l5" },
      { beforeId: "L2", afterId: "L3", reasonKey: "library-03.l2-before-l3" },
      { beforeId: "L4", afterId: "L5", reasonKey: "library-03.l4-before-l5" },
    ],
    acceptedOrderIds: ["L1-L2-L3-L4-L5", "L1-L4-L5-L2-L3"],
    offTopicSentenceIds: [],
    connectorOptions: [
      { id: "library-03.conn-contrast", text: "반면에", relations: ["compare"] },
      { id: "library-03.conn-but", text: "하지만", relations: ["compare"] },
      { id: "library-03.conn-therefore", text: "그래서", relations: ["cause-effect"] },
      { id: "library-03.conn-and", text: "그리고", relations: ["description"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성. 특정 도서관을 가리키지 않음.",
    reviewStatus: "pending",
    misconceptionGuard:
      "조용함 비교와 밝기 비교를 섞어 묶지 않고, 같은 기준끼리 창가/안쪽에 대응시킨다.",
  },
  {
    id: "paragraph-bottle-04",
    relation: "problem-solution",
    sentences: [
      { id: "B1", text: "점심시간 뒤 물병이 보이지 않았습니다.", roles: ["topic"] },
      { id: "B2", text: "책상 아래를 살펴보았지만 없었습니다.", roles: ["support"] },
      { id: "B3", text: "마지막으로 간 미술실을 떠올렸습니다.", roles: ["support"] },
      { id: "B4", text: "미술실 선반에서 물병을 찾았습니다.", roles: ["support"] },
      { id: "B5", text: "앞으로 물병에 이름표를 붙이기로 했습니다.", roles: ["support", "closing"] },
    ],
    topicSentenceIds: ["B1"],
    precedencePairs: [
      { beforeId: "B1", afterId: "B2", reasonKey: "bottle-04.b1-before-b2" },
      { beforeId: "B1", afterId: "B3", reasonKey: "bottle-04.b1-before-b3" },
      { beforeId: "B1", afterId: "B4", reasonKey: "bottle-04.b1-before-b4" },
      { beforeId: "B1", afterId: "B5", reasonKey: "bottle-04.b1-before-b5" },
      { beforeId: "B2", afterId: "B3", reasonKey: "bottle-04.b2-before-b3" },
      { beforeId: "B3", afterId: "B4", reasonKey: "bottle-04.b3-before-b4" },
      { beforeId: "B4", afterId: "B5", reasonKey: "bottle-04.b4-before-b5" },
    ],
    acceptedOrderIds: ["B1-B2-B3-B4-B5"],
    offTopicSentenceIds: [],
    connectorOptions: [
      { id: "bottle-04.conn-therefore", text: "그래서", relations: ["cause-effect", "problem-solution"] },
      { id: "bottle-04.conn-finally", text: "결국", relations: ["problem-solution"] },
      { id: "bottle-04.conn-but", text: "하지만", relations: ["compare"] },
      { id: "bottle-04.conn-example", text: "예를 들어", relations: ["description"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성. 실제 학생 사례가 아님.",
    reviewStatus: "pending",
    misconceptionGuard:
      "문제 확인(B1~B2)보다 해결 결과(물병을 찾음)를 먼저 단정하지 않는다.",
  },
  {
    id: "paragraph-butterfly-05",
    relation: "description",
    sentences: [
      { id: "F1", text: "관찰한 나비의 날개에는 두 가지 특징이 있었습니다.", roles: ["topic"] },
      { id: "F2", text: "날개 가장자리는 검은색이었습니다.", roles: ["support"] },
      { id: "F3", text: "가운데에는 둥근 무늬가 있었습니다.", roles: ["support"] },
      { id: "F4", text: "두 특징을 그림에 표시했습니다.", roles: ["support", "closing"] },
      { id: "FX", text: "점심에는 과일을 먹었습니다.", roles: ["off-topic"] },
    ],
    topicSentenceIds: ["F1"],
    precedencePairs: [
      { beforeId: "F1", afterId: "F2", reasonKey: "butterfly-05.f1-before-f2" },
      { beforeId: "F1", afterId: "F3", reasonKey: "butterfly-05.f1-before-f3" },
      { beforeId: "F1", afterId: "F4", reasonKey: "butterfly-05.f1-before-f4" },
      { beforeId: "F2", afterId: "F4", reasonKey: "butterfly-05.f2-before-f4" },
      { beforeId: "F3", afterId: "F4", reasonKey: "butterfly-05.f3-before-f4" },
    ],
    acceptedOrderIds: ["F1-F2-F3-F4", "F1-F3-F2-F4"],
    offTopicSentenceIds: ["FX"],
    connectorOptions: [
      { id: "butterfly-05.conn-and", text: "그리고", relations: ["description"] },
      { id: "butterfly-05.conn-also", text: "또한", relations: ["description"] },
      { id: "butterfly-05.conn-therefore", text: "그래서", relations: ["cause-effect"] },
      { id: "butterfly-05.conn-but", text: "하지만", relations: ["compare"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성.",
    reviewStatus: "pending",
    misconceptionGuard:
      "날개 특징과 무관한 급식 문장(FX)을 특징 묶음에 넣지 않는다.",
  },
  {
    id: "paragraph-playground-06",
    relation: "claim-support",
    sentences: [
      { id: "P1", text: "빈 공간에 작은 그늘 쉼터를 만들면 좋겠습니다.", roles: ["topic"] },
      { id: "P2", text: "햇볕이 강한 날에도 쉴 수 있습니다.", roles: ["support"] },
      { id: "P3", text: "잠시 쉬고 다시 안전하게 놀이할 수 있습니다.", roles: ["support"] },
      { id: "P4", text: "그래서 그늘 쉼터가 우리에게 도움이 됩니다.", roles: ["support", "closing"] },
    ],
    topicSentenceIds: ["P1"],
    precedencePairs: [
      { beforeId: "P1", afterId: "P2", reasonKey: "playground-06.p1-before-p2" },
      { beforeId: "P1", afterId: "P3", reasonKey: "playground-06.p1-before-p3" },
      { beforeId: "P1", afterId: "P4", reasonKey: "playground-06.p1-before-p4" },
      { beforeId: "P2", afterId: "P4", reasonKey: "playground-06.p2-before-p4" },
      { beforeId: "P3", afterId: "P4", reasonKey: "playground-06.p3-before-p4" },
    ],
    acceptedOrderIds: ["P1-P2-P3-P4", "P1-P3-P2-P4"],
    offTopicSentenceIds: [],
    connectorOptions: [
      { id: "playground-06.conn-because", text: "왜냐하면", relations: ["claim-support"] },
      { id: "playground-06.conn-reason", text: "그 이유는", relations: ["claim-support"] },
      { id: "playground-06.conn-example", text: "예를 들어", relations: ["description"] },
      { id: "playground-06.conn-first", text: "먼저", relations: ["sequence"] },
    ],
    sourceNote: "계획 문서 2026-08-28 §4.1 고정 문장 fixture에서 작성. 실제 학교 공간이 아님.",
    reviewStatus: "pending",
    misconceptionGuard:
      "근거 두 문장(P2, P3)은 어떤 순서로 놓아도 되지만 주장(P1)→근거→마무리(P4) 관계가 유지되어야 한다.",
  },
];

/** reasonKey → 학생용 근거 문구. 판정 결과의 evidenceKeys를 이 사전으로 번역한다. */
export const pairFeedback: Readonly<Record<string, string>> = {
  "garden-01.g1-first": "우리 반이 씨앗을 심었다는 소개가 문단의 시작이에요.",
  "garden-01.g2-before-g3": "흙을 다듬은 다음에 구멍에 씨앗을 넣어요.",
  "garden-01.g2-before-g4": "흙을 다듬은 다음에 이름표를 꽂을 수 있어요.",
  "garden-01.g3-before-g5": "씨앗을 넣은 다음에 흙을 덮고 물을 줘요.",
  "garden-01.g4-before-g5": "이름표를 꽂은 다음에 마지막으로 흙을 덮고 물을 줘요.",
  "rain-02.r1-first": "'달라졌습니다'라고 알려 주는 문장이 문단의 시작이에요.",
  "rain-02.r1-before-r3": "소개 문장이 맨 앞에 와야 해요.",
  "rain-02.r1-before-r4": "소개 문장이 맨 앞에 와야 해요.",
  "rain-02.r2-before-r3": "비가 온 것이 원인이고 바닥이 젖은 것이 결과예요. 순서를 바꾸면 원인과 결과가 뒤집혀요.",
  "rain-02.r3-before-r4": "바닥이 젖어서 체육관에서 수업했어요. '그래서'가 앞뒤를 이어 줘요.",
  "library-03.l1-before-l2": "두 공간을 소개하는 문장이 문단의 시작이에요.",
  "library-03.l1-before-l3": "두 공간을 소개하는 문장이 문단의 시작이에요.",
  "library-03.l1-before-l4": "두 공간을 소개하는 문장이 문단의 시작이에요.",
  "library-03.l1-before-l5": "두 공간을 소개하는 문장이 문단의 시작이에요.",
  "library-03.l2-before-l3": "창가와 안쪽의 밝기 비교는 서로 붙여 두면 더 분명해요.",
  "library-03.l4-before-l5": "창가와 안쪽의 소리 비교는 서로 붙여 두면 더 분명해요.",
  "bottle-04.b1-before-b2": "물병이 보이지 않는다는 문제 제시가 문단의 시작이에요.",
  "bottle-04.b1-before-b3": "문제를 먼저 알리고, 찾은 이야기를 그다음에 써요.",
  "bottle-04.b1-before-b4": "문제를 먼저 알리고, 찾은 이야기를 그다음에 써요.",
  "bottle-04.b1-before-b5": "문제를 먼저 알리고, 마무리는 나중에 써요.",
  "bottle-04.b2-before-b3": "책상 아래를 살펴봐도 없었으니 마지막으로 간 미술실을 떠올려요.",
  "bottle-04.b3-before-b4": "미술실을 떠올린 다음에 가서 확인해요.",
  "bottle-04.b4-before-b5": "물병을 찾은 다음에 앞으로의 약속(이름표)을 정해요.",
  "butterfly-05.f1-before-f2": "두 가지 특징을 알려 주는 문장이 문단의 시작이에요.",
  "butterfly-05.f1-before-f3": "두 가지 특징을 알려 주는 문장이 문단의 시작이에요.",
  "butterfly-05.f1-before-f4": "두 가지 특징을 알려 주는 문장이 문단의 시작이에요.",
  "butterfly-05.f2-before-f4": "두 특징을 모두 소개한 다음에 그림에 표시했어요.",
  "butterfly-05.f3-before-f4": "두 특징을 모두 소개한 다음에 그림에 표시했어요.",
  "playground-06.p1-before-p2": "'만들면 좋겠습니다'라는 제안이 문단의 시작이에요.",
  "playground-06.p1-before-p3": "'만들면 좋겠습니다'라는 제안이 문단의 시작이에요.",
  "playground-06.p1-before-p4": "제안이 맨 앞에 오고 마무리는 나중에 와요.",
  "playground-06.p2-before-p4": "근거를 소개한 다음에 '그래서'로 도움이 된다는 마무리가 와요.",
  "playground-06.p3-before-p4": "근거를 소개한 다음에 '그래서'로 도움이 된다는 마무리가 와요.",
  "topic.accepted": "문단의 중심 생각을 담은 문장을 골랐어요.",
  "topic.rejected": "이 문장은 중심 생각을 직접 말하지 않아요. 문단 전체를 한 문장으로 소개한다면 무엇인지 다시 보세요.",
  "offtopic.missing": "문단의 흐름에 필요한 문장이 보관함에 남아 있어요. 원래 자리로 돌려 보세요.",
  "offtopic.wrong": "이 문장은 문단의 중심 생각과 이어져 있어요. 보관함에 두면 문단의 뜻이 달라져요.",
  "connector.accepted": "앞뒤 문장이 이어지는 관계에 맞는 표현을 골랐어요.",
  "connector.rejected": "이 표현은 앞뒤 문장의 관계와 어울리지 않아요. 두 문장이 어떻게 이어지는지 다시 읽어 보세요.",
};

/** evidenceKeys를 학생용 문구로 번역한다. 없는 키는 키 자체를 돌려준다. */
export function feedbackText(key: string): string {
  return pairFeedback[key] ?? key;
}

/** 미션 제목(입구·보고서 표시용). */
export const missionTitles: Readonly<Record<MissionId, string>> = {
  "paragraph-garden-01": "학교 화단 씨앗 심기",
  "paragraph-rain-02": "젖은 운동장",
  "paragraph-library-03": "두 독서 공간 비교",
  "paragraph-bottle-04": "잃어버린 물병 찾기",
  "paragraph-butterfly-05": "나비 관찰 설명",
  "paragraph-playground-06": "놀이 공간 제안",
};

/** 관계 라벨(학생용). */
export const relationLabels: Readonly<Record<Relation, string>> = {
  sequence: "시간 순서",
  "cause-effect": "원인과 결과",
  compare: "비교",
  "problem-solution": "문제와 해결",
  description: "설명",
  "claim-support": "주장과 근거",
};

/** 학생이 처음 읽는 문장 띠 순서(표시 데이터이지 정답이 아니다). */
export const initialOrderIds: Readonly<Record<MissionId, readonly string[]>> = {
  "paragraph-garden-01": ["G1", "G3", "G2", "GX", "G5", "G4"],
  "paragraph-rain-02": ["R3", "R1", "RX", "R4", "R2"],
  "paragraph-library-03": ["L2", "L4", "L1", "L5", "L3"],
  "paragraph-bottle-04": ["B1", "B3", "B4", "B2", "B5"],
  "paragraph-butterfly-05": ["F1", "FX", "F4", "F2", "F3"],
  "paragraph-playground-06": ["P1", "P3", "P4", "P2"],
};

// 빌드 시 콘텐츠 무결성 강제(계획 문서 §7.2).
assertContentValid(missions, pairFeedback);
