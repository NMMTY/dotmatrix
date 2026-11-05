"use client";

import type { StyleProps } from "../../system/types";
import { useControllableState } from "../../system/useControllableState";
import { Button } from "../Button/Button";
import { Column } from "../Column/Column";
import { Flex } from "../Flex/Flex";
import { Icon } from "../Icon/Icon";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Stepper.module.scss";

export interface StepperStep {
  label: string;
  description?: string;
}

export interface StepperOwnProps extends StyleProps {
  steps: StepperStep[];
  /** 0-based index of the active step. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Renders Back/Next (Finish on the last step) controls below the indicator. @default false */
  showControls?: boolean;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  onFinish?: () => void;
  /** Lets clicking an already-visited step jump back to it — never forward, past what's been reached. @default true */
  allowNavigation?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * A linear progress indicator for multi-step flows — markers connected by a
 * line that fills in as steps complete. This renders the indicator (and,
 * with `showControls`, Back/Next buttons that drive it) only; which content
 * shows for the active step is the consumer's own `step`/`onStepChange`-
 * driven render, the same division of responsibility as `Pagination` and
 * whatever list it pages through.
 */
function StepperImpl({
  steps,
  step,
  defaultStep,
  onStepChange,
  orientation = "horizontal",
  showControls = false,
  nextLabel = "Next",
  backLabel = "Back",
  finishLabel = "Finish",
  onFinish,
  allowNavigation = true,
  disabled,
  className,
  ...rest
}: StepperOwnProps) {
  const [current, setCurrent] = useControllableState(step, defaultStep ?? 0, onStepChange);
  const lastIndex = steps.length - 1;
  const isVertical = orientation === "vertical";

  const goTo = (index: number) => {
    if (disabled || index < 0 || index > lastIndex) return;
    setCurrent(index);
  };

  return (
    <Column gap="16" {...rest} className={className}>
      <Flex
        as="ol"
        aria-label="Progress"
        direction={isVertical ? "column" : "row"}
        // Horizontal steps fill the row via `.step`'s own flex-grow (the
        // connector bridges the visual gap between markers), but vertical
        // steps have no extra space to distribute that way — without an
        // explicit gap here they stack with zero breathing room between them.
        gap={isVertical ? "16" : "0"}
        className={[styles.track, isVertical ? styles.vertical : styles.horizontal].join(" ")}
      >
        {steps.map((s, index) => {
          const status = index < current ? "complete" : index === current ? "current" : "upcoming";
          const reachable = !disabled && allowNavigation && index <= current;
          return (
            <Flex
              key={s.label}
              as="li"
              direction={isVertical ? "row" : "column"}
              alignItems={isVertical ? "start" : "center"}
              gap="8"
              className={styles.step}
            >
              <Row
                as="span"
                className={[
                  styles.connector,
                  index <= current ? styles.connectorComplete : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              />
              <Row
                as="button"
                alignItems="center"
                justifyContent="center"
                type="button"
                data-index={index}
                disabled={!reachable}
                aria-current={status === "current" ? "step" : undefined}
                aria-label={`Step ${index + 1} of ${steps.length}: ${s.label} (${status})`}
                onClick={() => goTo(index)}
                className={[styles.marker, styles[status]].join(" ")}
              >
                {status === "complete" ? (
                  <Icon name="check" size="s" />
                ) : (
                  <span aria-hidden>{index + 1}</span>
                )}
              </Row>
              <Column
                gap="2"
                alignItems={isVertical ? "start" : "center"}
                className={styles.labels}
              >
                <Text fontSize="s" weight={status === "current" ? "medium" : undefined}>
                  {s.label}
                </Text>
                {s.description && (
                  <Text fontSize="xs" color="weak">
                    {s.description}
                  </Text>
                )}
              </Column>
            </Flex>
          );
        })}
      </Flex>

      {showControls && (
        <Row gap="8" justifyContent="between">
          <Button
            variant="outline"
            size="s"
            disabled={disabled || current === 0}
            onClick={() => goTo(current - 1)}
          >
            {backLabel}
          </Button>
          <Button
            variant="solid"
            size="s"
            disabled={disabled}
            onClick={() => (current === lastIndex ? onFinish?.() : goTo(current + 1))}
          >
            {current === lastIndex ? finishLabel : nextLabel}
          </Button>
        </Row>
      )}
    </Column>
  );
}
StepperImpl.displayName = "Stepper";

export const Stepper = StepperImpl;
