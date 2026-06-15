import { Tabs } from "@heroui/react";
import type { Key, ReactNode } from "react";
import { SharedElementTransition } from "react-aria-components/SharedElementTransition";

export type SegmentTabOption<T extends string> = {
  key: T;
  label: string;
  shortLabel?: string;
};

export function SegmentTabs<T extends string>({
  ariaLabel,
  selectedKey,
  options,
  onChange,
  variant = "primary",
  className = "config-tabs",
  listClassName = "config-tabs-list",
}: {
  ariaLabel: string;
  selectedKey: T;
  options: SegmentTabOption<T>[];
  onChange: (key: T) => void;
  variant?: "primary" | "secondary";
  className?: string;
  listClassName?: string;
}) {
  return (
    <Tabs
      aria-label={ariaLabel}
      variant={variant}
      selectedKey={selectedKey}
      onSelectionChange={(key: Key) => onChange(String(key) as T)}
      className={className}
    >
      <SharedElementTransition>
        <Tabs.ListContainer>
          <Tabs.List className={listClassName}>
            {options.map((option) => (
              <Tabs.Tab key={option.key} id={option.key} aria-label={option.label}>
                {option.shortLabel ?? option.label}
                <Tabs.Separator />
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </SharedElementTransition>
    </Tabs>
  );
}

export function SegmentTabLabel({ children }: { children: ReactNode }) {
  return <span className="segment-tab-label">{children}</span>;
}
