import { Slider } from "@heroui/react";

/**
 * QualitySlider — 质量等级滑块
 *
 * 还原 SwiftUI QualitySlider：
 * - 标签行: "质量" + 当前等级数字
 * - 滑块: 1-6 步进
 * - 底部标签: "质量最佳" ↔ "体积最小"
 */
export function QualitySlider({
  value,
  onChange,
  disabled,
  title = "质量",
  minValue = 1,
  maxValue = 6,
  step = 1,
  minLabel = "质量最佳",
  maxLabel = "体积最小",
  valueLabel,
  showTooltip = false,
  showValue = true,
  showTitle = true,
  compact = false,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  title?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  valueLabel?: string;
  showTooltip?: boolean;
  showValue?: boolean;
  showTitle?: boolean;
  compact?: boolean;
}) {
  const displayValue = valueLabel ?? value;

  return (
    <div className={`quality-slider ${compact ? "is-compact" : ""} ${disabled ? "opacity-55" : ""}`}>
      {(showTitle || showValue) && (
        <div className="flex items-center justify-between">
          {showTitle && <span className="text-[14px] font-semibold text-default-500">{title}</span>}
          {showValue && (
            <span className="text-[15px] font-bold tabular-nums text-default-500">{displayValue}</span>
          )}
        </div>
      )}
      <Slider
        step={step}
        minValue={minValue}
        maxValue={maxValue}
        value={value}
        onChange={(v) => onChange(v as number)}
        isDisabled={disabled}
        className="quality-slider-root"
      >
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb>
            {showTooltip && (
              <span className="quality-slider-tooltip">
                {displayValue}
              </span>
            )}
          </Slider.Thumb>
        </Slider.Track>
      </Slider>
      <div className="flex justify-between text-[11px] font-medium text-default-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
