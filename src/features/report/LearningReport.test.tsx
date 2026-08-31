import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, type Mock } from "vitest";
import type { RefObject } from "react";
import LearningReport from "./LearningReport";
import { missionTitles, missions } from "../../content/missions";
import { createInitialSessionState, type MissionRecord, type SessionAction, type SessionState } from "../../app/sessionReducer";
import type { MissionId } from "../../domain/types";

const garden = missions[0]!;
const gardenText = (id: string) => garden.sentences.find((s) => s.id === id)!.text;

function completeState(): SessionState {
  const base = createInitialSessionState();
  const fill = (
    missionIndex: number,
    missionId: MissionId,
    orderIds: string[],
    extra: Partial<MissionRecord> = {},
  ): MissionRecord => ({
    missionIndex,
    revision: 6,
    firstJudgment: "needs-repair",
    topicSentenceId: missions.find((m) => m.id === missionId)!.topicSentenceIds[0]!,
    orderIds,
    removedSentenceIds:
      missions.find((m) => m.id === missionId)!.offTopicSentenceIds.length > 0
        ? missions.find((m) => m.id === missionId)!.offTopicSentenceIds
        : [],
    connectorId: missions.find((m) => m.id === missionId)!.connectorOptions[0]!.id,
    relationLabel: missions.find((m) => m.id === missionId)!.relation,
    reasonText: `${missionIndex + 1}번 이유`,
    ...extra,
  });

  return {
    ...base,
    step: "REPORT",
    phase: "complete",
    records: base.records.map((_r, i) => {
      const id = missions[i]!.id;
      if (i === 0) {
        return fill(0, id, ["G1", "G2", "G4", "G3", "G5", "GX"]);
      }
      if (i === 1) {
        // 원인과 결과가 뒤집힌 최종 상태 → 근거 피드백이 보여야 한다.
        return fill(1, id, ["R1", "R3", "R2", "R4", "RX"]);
      }
      const accepted = missions.find((m) => m.id === id)!.acceptedOrderIds[0]!.split("-");
      return fill(i, id, accepted);
    }),
  };
}

function setup(state: SessionState = completeState()) {
  const dispatch = vi.fn() as Mock<(action: SessionAction) => void>;
  const headingRef: RefObject<HTMLHeadingElement> = { current: null };
  render(<LearningReport state={state} dispatch={dispatch} headingRef={headingRef} />);
  return { dispatch };
}

describe("수리 기록 보고서", () => {
  it("6개 미션의 처음 순서와 최종 순서를 나란히 보여 준다", () => {
    setup();
    for (const mission of missions) {
      expect(screen.getByText(new RegExp(missionTitles[mission.id]))).toBeInTheDocument();
    }
    expect(screen.getAllByText(/미션 처음 순서/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/미션 최종 순서/).length).toBeGreaterThanOrEqual(1);
    const first = screen.getByRole("list", { name: /1번 미션 처음 순서/ });
    expect(first).toHaveTextContent(gardenText("G1"));
    const final = screen.getByRole("list", { name: /1번 미션 최종 순서/ });
    expect(final).toHaveTextContent(gardenText("G4"));
  });

  it("총점이나 순위 대신 관계별 수리 근거를 보여 준다", () => {
    setup();
    expect(screen.queryByText(/점수/)).not.toBeInTheDocument();
    expect(screen.queryByText(/순위/)).not.toBeInTheDocument();

    const gardenEvidence = screen.getByRole("list", { name: /1번 미션 수리 근거/ });
    expect(gardenEvidence).toHaveTextContent("맞게 이어진 관계");
    expect(gardenEvidence).toHaveTextContent("흙을 다듬은 다음에 구멍에 씨앗을 넣어요.");

    // 뒤집힌 원인·결과는 다시 볼 근거로 남는다.
    const rainEvidence = screen.getByRole("list", { name: /2번 미션 수리 근거/ });
    expect(rainEvidence).toHaveTextContent("다시 볼 관계");
    expect(rainEvidence).toHaveTextContent("원인과 결과가 뒤집혀요");
  });

  it("다음 글에 적용할 세 단계 전략과 쉬운 범위 안내를 보여 준다", () => {
    setup();
    const takeaway = screen.getByRole("region", { name: "다음 글에 써 볼 방법" });
    expect(takeaway).toHaveTextContent("중심 생각 찾기");
    expect(takeaway).toHaveTextContent("문장 관계 살피기");
    expect(takeaway).toHaveTextContent("근거로 말하기");
    expect(screen.getByText(/국어 교사가 검수 중이에요/)).toBeInTheDocument();
    expect(screen.getByText(/모든 글에 똑같이 맞는 것은 아니에요/)).toBeInTheDocument();
  });

  it("최초 판단, 중심 문장, 보관함, 이어 주는 말, 이유를 미션별로 보여 준다", () => {
    setup();
    const article = screen.getByRole("article", { name: /1번 미션/ });
    expect(article).toHaveTextContent("고쳐야 할 것 같았어요");
    expect(article).toHaveTextContent(`중심 문장: ${gardenText("G1")}`);
    expect(article).toHaveTextContent(`보관한 문장: ${gardenText("GX")}`);
    expect(article).toHaveTextContent("이어 주는 말: 먼저");
    expect(article).toHaveTextContent("선택한 관계: 시간 순서");
    expect(article).toHaveTextContent("남긴 이유: 1번 이유");
  });

  it("새로고침하면 기록이 사라진다는 안내와 검수 안내를 보여 준다", () => {
    setup();
    expect(screen.getByText(/새로고침하면 사라져요/)).toBeInTheDocument();
    expect(screen.getByText(/국어 교사가 검수 중/)).toBeInTheDocument();
  });

  it("인쇄하기는 인쇄 대화상자를 연다", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    setup();
    await user.click(screen.getByRole("button", { name: "인쇄하기" }));
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("처음부터 다시 하기는 확인 대화상자를 거쳐 세션을 비운다", async () => {
    const user = userEvent.setup();
    const { dispatch } = setup();
    await user.click(screen.getByRole("button", { name: "처음부터 다시 하기" }));
    const dialog = screen.getByRole("dialog", { name: "처음부터 다시 할까요?" });
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("dialog", { name: "처음부터 다시 할까요?" })).not.toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "처음부터 다시 하기" }));
    await user.click(screen.getByRole("button", { name: "다시 시작할게요" }));
    expect(dispatch.mock.calls.some(([a]) => (a as SessionAction).type === "RESTART_CONFIRMED")).toBe(true);
  });
});
