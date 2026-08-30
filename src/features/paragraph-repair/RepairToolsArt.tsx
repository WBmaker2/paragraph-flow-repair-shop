import repairTools from "../../assets/generated/repair-tools-v2.webp";

/** 연필과 교정 도구는 실제 작업을 흉내 내지 않는 장식용 이미지다. */
export default function RepairToolsArt() {
  return (
    <div
      className="repair-tools-art"
      aria-hidden="true"
      style={{ backgroundImage: `url(${repairTools})` }}
    />
  );
}
