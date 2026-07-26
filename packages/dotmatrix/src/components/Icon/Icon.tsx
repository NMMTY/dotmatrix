import type { CSSProperties, Ref } from "react";
import { Glyph } from "../../icons/Glyph";
import { GLYPHS, type IconName } from "../../icons/glyphs";

const SIZE_PX = { s: 12, m: 16, l: 20 } as const;

export interface IconOwnProps {
  name: IconName;
  /** @default "m" */
  size?: keyof typeof SIZE_PX;
  /** Accessible name. Omit for a purely decorative icon (it's hidden from AT). */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

type IconProps = IconOwnProps & { ref?: Ref<SVGSVGElement> } & Record<string, unknown>;

/**
 * Every icon in the design system renders through this one component —
 * `name` looks up the bitmap in `icons/glyphs.ts` rather than each icon
 * being its own component. Fixed 16×16 viewBox, size in three steps, fill
 * inherited from `currentColor` so an icon always matches its surrounding
 * text without a color prop of its own.
 */
function IconImpl({ name, size = "m", title, ref, ...rest }: IconProps) {
  const px = SIZE_PX[size];
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: title is genuinely optional here — omitting it and setting aria-hidden is the correct pattern for a decorative icon, not an oversight.
    <svg
      ref={ref}
      width={px}
      height={px}
      viewBox="0 0 16 16"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <Glyph rows={GLYPHS[name]} />
    </svg>
  );
}
IconImpl.displayName = "Icon";

export const Icon = IconImpl;
export type { IconName };
