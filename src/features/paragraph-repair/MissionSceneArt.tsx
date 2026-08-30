import missionScenesAtlas from "../../assets/generated/mission-scenes-atlas-v2.webp";

const SCENE_POSITIONS = [
  "0% 0%",
  "50% 0%",
  "100% 0%",
  "0% 100%",
  "50% 100%",
  "100% 100%",
] as const;

interface MissionSceneArtProps {
  readonly missionIndex: number;
  readonly mode?: "crop" | "atlas";
  readonly className?: string;
}

/** 실제 미션 정보는 DOM에 두고, 장면 아틀라스는 맥락을 보조하는 장식으로만 사용한다. */
export default function MissionSceneArt({
  missionIndex,
  mode = "crop",
  className,
}: MissionSceneArtProps) {
  const position = mode === "atlas" ? "center" : SCENE_POSITIONS[missionIndex] ?? SCENE_POSITIONS[0];
  const classes = ["mission-scene-art", `mission-scene-art--${mode}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      aria-hidden="true"
      data-scene-index={missionIndex}
      style={{ backgroundImage: `url(${missionScenesAtlas})`, backgroundPosition: position }}
    />
  );
}
