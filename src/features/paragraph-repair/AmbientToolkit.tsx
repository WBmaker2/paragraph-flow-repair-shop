import correctionTape from "../../../assets/plates/correction-tape.webp";
import pencil from "../../../assets/plates/pencil.webp";
import binderClip from "../../../assets/plates/binder-clip.webp";
import paperStrips from "../../../assets/plates/paper-strips.webp";
import paperGround from "../../../assets/plates/paper-ground.png";

/** 실제 작업 UI를 흉내 내지 않는 입구 화면의 장식용 수리 도구 묶음. */
export default function AmbientToolkit() {
  return (
    <div className="ambient-toolkit" aria-hidden="true">
      <img className="ambient-toolkit__paper" src={paperGround} alt="" data-plate-source="assets/plates/paper-ground.png" />
      <img className="ambient-toolkit__tape" src={correctionTape} alt="" data-plate-source="assets/plates/correction-tape.png" />
      <img className="ambient-toolkit__pencil" src={pencil} alt="" data-plate-source="assets/plates/pencil.png" />
      <img className="ambient-toolkit__clip" src={binderClip} alt="" data-plate-source="assets/plates/binder-clip.png" />
      <img className="ambient-toolkit__strips" src={paperStrips} alt="" data-plate-source="assets/plates/paper-strips.png" />
    </div>
  );
}
