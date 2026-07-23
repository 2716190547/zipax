import { Switch } from "@heroui/react";
import type { ReactNode } from "react";

export function HeroSwitch({
  ariaLabel,
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
  size = "lg",
  children,
}: {
  ariaLabel: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (selected: boolean) => void;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}) {
  return (
    <Switch
      size={size}
      aria-label={ariaLabel}
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isDisabled={isDisabled}
    >
      <Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        {children}
      </Switch.Content>
    </Switch>
  );
}
