import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./Heading";

describe("Heading", () => {
  it("defaults to h2", () => {
    render(<Heading data-testid="el">Title</Heading>);
    expect(screen.getByTestId("el").tagName).toBe("H2");
  });

  it("renders the requested level", () => {
    render(<Heading as="h1" data-testid="el" />);
    expect(screen.getByTestId("el").tagName).toBe("H1");
  });
});
