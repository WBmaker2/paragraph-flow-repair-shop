import { describe, expect, it } from "vitest";
import { missions, pairFeedback } from "./missions";
import { validateContent } from "./validateContent";
import type { MissionId, ParagraphMission } from "../domain/types";

function patchMission(id: MissionId, patch: Partial<ParagraphMission>): ParagraphMission[] {
  return missions.map((m) => (m.id === id ? { ...m, ...patch } : m));
}

function codes(problems: readonly string[]): string[] {
  return problems.map((p) => p.split(":")[0]!);
}

describe("콘텐츠 검수기(validateContent)", () => {
  it("검수된 실제 콘텐츠는 문제를 보고하지 않는다", () => {
    expect(validateContent(missions, pairFeedback)).toEqual([]);
  });

  it("미션 수가 6개가 아니면 실패한다", () => {
    expect(codes(validateContent([missions[0]!], pairFeedback))).toContain("count");
  });

  it("문장 ID가 중복되면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, {
      sentences: [...garden.sentences, garden.sentences[0]!],
    });
    expect(codes(validateContent(patched, pairFeedback))).toContain("id-duplicate");
  });

  it("존재하지 않는 문장을 참조하면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, {
      precedencePairs: [
        ...garden.precedencePairs,
        { beforeId: "G1", afterId: "없는문장", reasonKey: "garden-01.bad" },
      ],
    });
    expect(codes(validateContent(patched, pairFeedback))).toContain("reference-missing");
  });

  it("precedencePairs가 2개 미만이면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, {
      precedencePairs: garden.precedencePairs.slice(0, 1),
    });
    expect(codes(validateContent(patched, pairFeedback))).toContain("pair-count");
  });

  it("중심 문장이 없으면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { topicSentenceIds: [] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("topic-missing");
  });

  it("문장 수가 4개 미만이면 실패한다", () => {
    const butterfly = missions.find((m) => m.id === "paragraph-butterfly-05")!;
    const patched = patchMission(butterfly.id, {
      sentences: butterfly.sentences.slice(0, 3),
    });
    expect(codes(validateContent(patched, pairFeedback))).toContain("sentence-count");
  });

  it("승인 순서가 없으면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { acceptedOrderIds: [] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("accepted-order");
  });

  it("승인 순서가 문단 문장을 온전히 담지 않으면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { acceptedOrderIds: ["G1-G2-G3-G4"] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("accepted-order");
  });

  it("승인 순서가 precedencePairs를 어기면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { acceptedOrderIds: ["G2-G1-G3-G4-G5"] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("accepted-order-consistency");
  });

  it("sourceNote가 비어 있으면 실패한다", () => {
    const rain = patchMission("paragraph-rain-02", { sourceNote: "" });
    expect(codes(validateContent(rain, pairFeedback))).toContain("source-note");
  });

  it("misconceptionGuard가 비어 있으면 실패한다", () => {
    const rain = patchMission("paragraph-rain-02", { misconceptionGuard: "" });
    expect(codes(validateContent(rain, pairFeedback))).toContain("misconception-guard");
  });

  it("근거 문구가 없으면 실패한다", () => {
    expect(codes(validateContent(missions, {}))).toContain("feedback");
  });

  it("off-topic이 아닌 문장을 off-topic으로 지정하면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { offTopicSentenceIds: ["G2"] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("off-topic-role");
  });

  it("이어 주는 말 선택지가 없으면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, { connectorOptions: [] });
    expect(codes(validateContent(patched, pairFeedback))).toContain("connector-options");
  });

  it("검수 상태가 pending이나 approved가 아니면 실패한다", () => {
    const garden = missions[0]!;
    const patched = patchMission(garden.id, {
      reviewStatus: "draft" as unknown as ParagraphMission["reviewStatus"],
    });
    expect(codes(validateContent(patched, pairFeedback))).toContain("review-status");
  });
});
