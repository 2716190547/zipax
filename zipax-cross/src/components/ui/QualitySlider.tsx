import { Slider } from "@heroui/react";
import { useI18n } from "@/i18n";

/**
 * QualitySlider — compact quality level control.
 */
export function QualitySlider({
  value,
  onChange,
  disabled,
  title,
  minValue = 1,
  maxValue = 6,
  step = 1,
  minLabel,
  maxLabel,
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
  const { t } = useI18n();
  const displayValue = valueLabel ?? value;
  const resolvedTitle = title ?? t("compression.quality");
  const resolvedMinLabel = minLabel ?? t("compression.bestQuality");
  const resolvedMaxLabel = maxLabel ?? t("compression.smallestSize");

  return (
    <div className={`quality-slider ${compact ? "is-compact" : ""} ${disabled ? "opacity-55" : ""}`}>
      {(showTitle || showValue) && (
        <div className="flex items-center justify-between">
          {showTitle && <span className="text-[14px] font-semibold text-default-500">{resolvedTitle}</span>}
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
        <span>{resolvedMinLabel}</span>
        <span>{resolvedMaxLabel}</span>
      </div>
    </div>
  );
}
