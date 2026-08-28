import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "ghost";
  /** gi-pulse는 문단 시험하기·수리 완료 확인 두 필수 행동에만 사용한다(계획 문서 §10). */
  readonly pulse?: boolean;
  readonly children: ReactNode;
}

export default function ActionButton({
  variant = "primary",
  pulse = false,
  children,
  className,
  type = "button",
  ...rest
}: ActionButtonProps) {
  const classes = ["action-button", `action-button--${variant}`, pulse ? "gi-pulse" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
