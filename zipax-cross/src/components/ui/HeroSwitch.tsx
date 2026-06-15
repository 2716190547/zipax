import { Switch } from "@heroui/react";
import type { ReactNode } from "react";

export function HeroSwitch({
  isSelected,
  defaultSelected,
  onChange,
  isDisabled,
  size = "lg",
  children,
}: {
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
      isSelected={isSelected}
      defaultSelected={defaultSelected}
      onChange={onChange}
      isDisabled={isDisabled}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      {children && <Switch.Content>{children}</Switch.Content>}
    </Switch>
  );
}
