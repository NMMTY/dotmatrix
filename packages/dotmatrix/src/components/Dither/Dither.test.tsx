import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dither } from "./Dither";

describe("Dither: SSR-safe placeholder before the image loads", () => {
  it("renders a Skeleton (not a crash, not a bare canvas with no size) when width/height aren't given", () => {
    const { container } = render(<Dither src="/nonexistent.png" alt="A photo" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders a sized <canvas> immediately when width/height are given, without waiting for load", () => {
    const { container } = render(
      <Dither src="/nonexistent.png" alt="A photo" width={64} height={64} />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("aria-label", "A photo");
  });
});
