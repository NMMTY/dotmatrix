import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExternalIcon } from "./ExternalIcon";

function MockIcon({ size, className }: { size?: number | string; className?: string }) {
  return (
    <svg
      data-testid="mock-icon"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0h10v10H0z" fill="#ff0000" />
    </svg>
  );
}

describe("ExternalIcon", () => {
  it("renders the given icon component", () => {
    render(<ExternalIcon icon={MockIcon} />);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("passes the size scale's pixel value through to the icon component", () => {
    render(<ExternalIcon icon={MockIcon} size="l" />);
    expect(screen.getByTestId("mock-icon")).toHaveAttribute("width", "20");
  });

  it("defaults to the medium size step", () => {
    render(<ExternalIcon icon={MockIcon} />);
    expect(screen.getByTestId("mock-icon")).toHaveAttribute("width", "16");
  });

  it("is hidden from assistive tech when no title is given", () => {
    const { container } = render(<ExternalIcon icon={MockIcon} />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("gets an accessible name when title is given", () => {
    render(<ExternalIcon icon={MockIcon} title="Beer" />);
    expect(screen.getByRole("img", { name: "Beer" })).toBeInTheDocument();
  });

  it("does not force monochrome by default", () => {
    const { container } = render(<ExternalIcon icon={MockIcon} />);
    expect(container.querySelector('[class*="monochrome"]')).not.toBeInTheDocument();
  });

  it("applies the monochrome class when forceMonochrome is set", () => {
    const { container } = render(<ExternalIcon icon={MockIcon} forceMonochrome />);
    expect(container.querySelector('[class*="monochrome"]')).toBeInTheDocument();
  });
});
