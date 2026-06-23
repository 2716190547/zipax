import { ListBox, Select } from "@heroui/react";
import type { Key } from "@heroui/react";
import type { ReactNode } from "react";

type Option<T extends string> = {
  key: T;
  label: string;
  icon?: ReactNode;
};

type HeroSelectProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
};

export function HeroSelect<T extends string>({ ariaLabel, value, options, onChange, className, triggerIcon, triggerLabel }: HeroSelectProps<T>) {
  return (
    <Select
      aria-label={ariaLabel}
      selectedKey={value}
      onSelectionChange={(key: Key | null) => {
        if (key != null) onChange(String(key) as T);
      }}
      className={className}
      variant="secondary"
    >
      <Select.Trigger className="site-select-trigger">
        {triggerIcon && <span className="select-trigger-icon">{triggerIcon}</span>}
        {triggerLabel ? <span className="site-select-value">{triggerLabel}</span> : <Select.Value className="site-select-value" />}
        <Select.Indicator className="site-select-indicator" />
      </Select.Trigger>
      <Select.Popover className="hero-select-popover">
        <ListBox aria-label={ariaLabel} items={options} className="hero-select-listbox">
          {(item) => (
            <ListBox.Item id={item.key} textValue={item.label} className="hero-select-option">
              {item.icon && <span className="select-option-icon">{item.icon}</span>}
              {item.label}
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
