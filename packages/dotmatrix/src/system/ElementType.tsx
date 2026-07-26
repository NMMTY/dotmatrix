import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ElementType as ReactElementType,
  ReactNode,
  Ref,
} from "react";

/**
 * Polymorphic rendering: primitives express *layout*, `as` expresses
 * *semantics* (`<Column as="nav">` stays a layout primitive in code but a
 * real `<nav>` in the DOM). `href` alone renders as `<a>`, since that's
 * common enough not to want `as="a"` spelled out every time.
 *
 * Targets React 19's ref-as-prop model rather than `forwardRef`, which pins
 * a component to one exported element type and would make `as="nav"` a type
 * error; the `PolymorphicComponent` cast at each primitive's export restores
 * per-call generic inference for `as`.
 */
export type AsProp<E extends ReactElementType> = { as?: E };

export type PolymorphicProps<E extends ReactElementType, OwnProps> = OwnProps &
  AsProp<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof OwnProps | "as"> & {
    ref?: Ref<Element>;
  };

export type PolymorphicComponent<DefaultElement extends ReactElementType, OwnProps> = <
  E extends ReactElementType = DefaultElement,
>(
  props: PolymorphicProps<E, OwnProps>,
) => ReactElement | null;

interface ElementTypeProps {
  as?: ReactElementType;
  href?: string;
  ref?: Ref<Element>;
  children?: ReactNode;
  [key: string]: unknown;
}

export function ElementType({ as, href, ref, children, ...rest }: ElementTypeProps) {
  const Component = as ?? (href ? "a" : "div");
  return (
    // biome-ignore lint/suspicious/noExplicitAny: the concrete element is only known at runtime
    <Component ref={ref as any} href={href} {...rest}>
      {children}
    </Component>
  );
}
