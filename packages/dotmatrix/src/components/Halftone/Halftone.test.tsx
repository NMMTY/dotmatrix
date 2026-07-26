import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Halftone } from "./Halftone";

describe("Halftone: SSR-safe placeholder before the image loads", () => {
  it("renders a Skeleton when width/height aren't given", () => {
    const { container } = render(<Halftone src="/nonexistent.png" alt="A photo" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });
});
