"use client";

import { useState } from "react";
import { useControllableState } from "../../system/useControllableState";
import { useFormField } from "../../system/useFormField";
import { Column } from "../Column/Column";
import { FieldShell } from "../FieldShell/FieldShell";
import { Input } from "../Input/Input";
import { Popover } from "../Popover/Popover";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./ColorInput.module.scss";
import { hexToHsl, hslToHex, isValidHex } from "./color";

export interface ColorInputOwnProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  /** A hex color, e.g. `"#3b82f6"`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Quick-pick hex swatches shown above the hue/lightness grid — e.g. the current accent palette's stops. Omit for none. */
  swatches?: string[];
  disabled?: boolean;
  className?: string;
}

const HUE_STEPS = 12;
const SATURATION_STEPS = [20, 40, 60, 80, 100];
const LIGHTNESS_STEPS = [80, 65, 50, 35, 20];
const HEX_PATTERN = "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$";

/**
 * A fully custom picker, not a wrapper over native `<input type="color">` —
 * hue and saturation/lightness are each a grid of solid, individually
 * clickable swatches (real buttons, so Tab/Enter already make them keyboard-
 * operable — no bespoke arrow-key handling needed) rather than a continuous
 * gradient, which has no bitmap equivalent (same reasoning as `Skeleton`'s
 * stepped shimmer and `tokens/shadow.scss`'s hard offsets).
 */
function ColorInputImpl({
  label,
  description,
  error,
  success,
  value,
  defaultValue,
  onChange,
  swatches = [],
  disabled,
  className,
}: ColorInputOwnProps) {
  const { fieldId, hintKind, hintId, describedBy } = useFormField({ error, success, description });
  const [current, setCurrent] = useControllableState(value, defaultValue ?? "#000000", onChange);
  const [hexDraft, setHexDraft] = useState(current);
  const hsl = hexToHsl(current) ?? { h: 0, s: 0, l: 50 };
  const isGrayscale = hsl.s === 0;

  const commit = (hex: string) => {
    setCurrent(hex);
    setHexDraft(hex);
  };

  const handleHexInput = (next: string) => {
    setHexDraft(next);
    if (isValidHex(next)) commit(next.startsWith("#") ? next : `#${next}`);
  };

  const hueStep = 360 / HUE_STEPS;
  const selectedHueIndex = Math.round(hsl.h / hueStep) % HUE_STEPS;

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      description={description}
      error={error}
      success={success}
      hintKind={hintKind}
      hintId={hintId}
      disabled={disabled}
    >
      <Popover
        trigger={
          // `aria-label` here isn't decorative redundancy: FieldShell's own
          // `<label for={fieldId}>` would otherwise win the accessible-name
          // computation over this button's visible content entirely (native
          // label association beats a button's own text) — announcing just
          // "Color" with no current value at all. Confirmed live via a
          // failing accessible-name query in this component's own tests.
          <button
            type="button"
            id={fieldId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-label={label ? `${label}: ${current}` : current}
            className={[styles.trigger, className].filter(Boolean).join(" ")}
          >
            <span className={styles.swatch} style={{ background: current }} aria-hidden />
            <Text fontSize="s" font="mono">
              {current}
            </Text>
          </button>
        }
      >
        <Column gap="12" style={{ width: 216 }}>
          {swatches.length > 0 && (
            <Row gap="4" wrap="wrap">
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Use ${swatch}`}
                  onClick={() => commit(swatch)}
                  className={styles.presetSwatch}
                  style={{ background: swatch }}
                />
              ))}
            </Row>
          )}

          <Row gap="4" wrap="wrap">
            {Array.from({ length: HUE_STEPS }, (_, i) => {
              const hue = hueStep * i;
              return (
                <button
                  // Fixed hue steps around the wheel, not a reorderable list.
                  // biome-ignore lint/suspicious/noArrayIndexKey: see comment above
                  key={i}
                  type="button"
                  aria-label={`Hue ${Math.round(hue)}°`}
                  aria-pressed={i === selectedHueIndex}
                  onClick={() =>
                    commit(hslToHex(hue, isGrayscale ? 70 : hsl.s, isGrayscale ? 50 : hsl.l))
                  }
                  className={[
                    styles.hueSwatch,
                    i === selectedHueIndex ? styles.selected : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ background: hslToHex(hue, 80, 55) }}
                />
              );
            })}
          </Row>

          <Column gap="4">
            {LIGHTNESS_STEPS.map((lightness) => (
              <Row key={lightness} gap="4">
                {SATURATION_STEPS.map((saturation) => {
                  const hex = hslToHex(hsl.h, saturation, lightness);
                  const selected = hsl.s === saturation && hsl.l === lightness;
                  return (
                    <button
                      key={saturation}
                      type="button"
                      aria-label={`Saturation ${saturation}%, lightness ${lightness}%`}
                      aria-pressed={selected}
                      onClick={() => commit(hex)}
                      className={[styles.slCell, selected ? styles.selected : undefined]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ background: hex }}
                    />
                  );
                })}
              </Row>
            ))}
          </Column>

          <Input
            label="Hex"
            size="s"
            value={hexDraft}
            pattern={HEX_PATTERN}
            onChange={(e) => handleHexInput(e.target.value)}
          />
        </Column>
      </Popover>
    </FieldShell>
  );
}
ColorInputImpl.displayName = "ColorInput";

export const ColorInput = ColorInputImpl;
