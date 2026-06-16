import { Select, ListBox } from "@heroui/react";
import type { Key } from "@heroui/react";

type Option<T extends string> = {
  key: T;
  label: string;
};

export function HeroSelect<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  className,
  compact = false,
}: {
  ariaLabel: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  compact?: boolean;
}) {
  const selectClassName = [
    className,
    compact ? "hero-select-compact" : "",
  ].filter(Boolean).join(" ");

  return (
    <Select
      aria-label={ariaLabel}
      selectedKey={value}
      onSelectionChange={(key: Key | null) => {
        if (key != null) onChange(String(key) as T);
      }}
      className={selectClassName}
      variant="secondary"
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="hero-select-popover">
        <ListBox aria-label={ariaLabel} items={options} className="hero-select-listbox">
          {(item) => (
            <ListBox.Item id={item.key} textValue={item.label} className="hero-select-option">
              {item.label}
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
