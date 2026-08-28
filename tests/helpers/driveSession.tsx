import { screen } from "@testing-library/react";
import { expect } from "vitest";
import type { UserEvent } from "@testing-library/user-event";
import { missions, relationLabels } from "../../src/content/missions";
import type { ParagraphMission } from "../../src/domain/types";
import type { SessionStep } from "../../src/domain/types";

export function sentenceText(mission: ParagraphMission, id: string): string {
  return mission.sentences.find((s) => s.id === id)!.text;
}

export interface DriveOptions {
  /** 각 단계에 도착한 직후(상호작용 전)에 호출된다. */
  readonly onStep?: (step: SessionStep, missionIndex: number) => Promise<void> | void;
}

/**
 * 입구부터 6개 미션을 모두 거쳐 보고서까지 진행하는 학생 행동 드라이버.
 * ORDER는 초기 순서로 두 번 시험해 판단 보류 경로를 통과한다.
 */
export async function driveSession(user: UserEvent, options: DriveOptions): Promise<string[]> {
  const visited: string[] = [];
  const onStep = options.onStep ?? (async () => {});

  await user.click(screen.getByRole("button", { name: "활동 시작하기" }));

  for (let i = 0; i < missions.length; i += 1) {
    const mission = missions[i]!;

    visited.push(`READ:${i}`);
    await onStep("READ", i);
    await user.click(screen.getByRole("button", { name: "고쳐야 할 것 같아요" }));
    await user.click(screen.getByRole("button", { name: "다음" }));

    visited.push(`TOPIC:${i}`);
    await onStep("TOPIC", i);
    await user.click(
      screen.getByRole("button", { name: sentenceText(mission, mission.topicSentenceIds[0]!) }),
    );
    await user.click(screen.getByRole("button", { name: "고르기 완료" }));
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));

    visited.push(`ORDER:${i}`);
    await onStep("ORDER", i);
    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));
    await user.click(screen.getByRole("button", { name: "문단 시험하기" }));
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));

    visited.push(`RELEVANCE:${i}`);
    await onStep("RELEVANCE", i);
    if (mission.offTopicSentenceIds.length > 0) {
      await user.click(
        screen.getByRole("button", {
          name: `${sentenceText(mission, mission.offTopicSentenceIds[0]!)} 보관함으로 옮기기`,
        }),
      );
    } else {
      await user.click(screen.getByRole("button", { name: "벗어난 문장이 없어요" }));
    }
    await user.click(screen.getByRole("button", { name: "관련성 점검 완료" }));
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));

    visited.push(`CONNECTOR:${i}`);
    await onStep("CONNECTOR", i);
    const connector = mission.connectorOptions.find((o) => o.relations.includes(mission.relation))!;
    await user.click(screen.getByRole("button", { name: connector.text }));
    await user.click(screen.getByRole("button", { name: "선택 완료" }));
    await user.click(screen.getByRole("button", { name: "다음 단계로" }));

    visited.push(`EXPLAIN:${i}`);
    await onStep("EXPLAIN", i);
    await user.click(screen.getByRole("button", { name: relationLabels[mission.relation] }));
    await user.click(screen.getByRole("button", { name: "수리 완료 확인" }));
  }

  visited.push("REPORT");
  await onStep("REPORT", missions.length - 1);
  expect(screen.getByRole("heading", { level: 1, name: "수리 기록" })).toBeInTheDocument();
  return visited;
}
