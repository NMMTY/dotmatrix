"use client";

import { FloatingPortal } from "@floating-ui/react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useReducedMotion } from "../../system/useReducedMotion";
import { Column } from "../Column/Column";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { Row } from "../Row/Row";
import { Text } from "../Text/Text";
import styles from "./Toast.module.scss";

export type ToastVariant = "neutral" | "error" | "warning" | "success";

export interface ToastOptions {
  title: string;
  description?: string;
  /** @default "neutral" */
  variant?: ToastVariant;
  /** In ms. `Infinity` disables auto-dismiss. @default 5000 */
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Push and dismiss toast notifications from anywhere under a `ToastProvider`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a <ToastProvider>.");
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((toast: ToastOptions) => {
    const id = `toast-${nextId++}`;
    setToasts((current) => [...current, { id, ...toast }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <FloatingPortal>
        <Column gap="8" role="region" aria-label="Notifications" className={styles.viewport}>
          {toasts.map((toast) => (
            <ToastView key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </Column>
      </FloatingPortal>
    </ToastContext.Provider>
  );
}

const VARIANT_CLASS: Record<ToastVariant, string | undefined> = {
  neutral: undefined,
  error: styles.error,
  warning: styles.warning,
  success: styles.success,
};

// Kept in one place and mirrored into the CSS transition-duration below —
// the exit phase holds the toast in the DOM for exactly this long before
// the parent actually removes it from state, so the two must agree.
const EXIT_DURATION_MS = 150;

type Phase = "entering" | "visible" | "exiting";

function ToastView({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const { title, description, variant = "neutral", duration = 5000 } = toast;
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reducedMotion ? "visible" : "entering");

  // Two paint frames after mount, not one: flipping the class on the very
  // next frame can still land in the same style-recalc batch as the initial
  // "entering" styles in some browsers, skipping straight to "visible" with
  // no transition ever registered. Waiting a frame further guarantees the
  // browser has committed the starting state first.
  useEffect(() => {
    if (reducedMotion) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("visible"));
    });
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const startExit = useCallback(() => {
    if (reducedMotion) {
      onDismiss();
      return;
    }
    setPhase("exiting");
  }, [reducedMotion, onDismiss]);

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return;
    const timer = setTimeout(startExit, duration);
    return () => clearTimeout(timer);
  }, [duration, startExit]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: onDismiss is intentionally excluded — re-arming this effect whenever its identity changes would restart the exit-hold timer mid-exit, or reset a toast's remaining time in the effect above.
  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = setTimeout(onDismiss, EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <Row
      role={variant === "error" ? "alert" : "status"}
      gap="12"
      className={[styles.toast, VARIANT_CLASS[variant], styles[phase]].filter(Boolean).join(" ")}
    >
      <Column gap="2" flexGrow="1">
        <Text fontSize="s" weight="medium">
          {title}
        </Text>
        {description && (
          <Text fontSize="xs" color="weak">
            {description}
          </Text>
        )}
      </Column>
      <IconButton aria-label="Dismiss" variant="ghost" size="s" onClick={startExit}>
        <Icon name="close" size="s" />
      </IconButton>
    </Row>
  );
}
