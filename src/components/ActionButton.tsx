import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "ghost";
  /** 현재 단계에서 반드시 해야 하는 행동을 짧게 표시한다(계획 문서 §10). */
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
