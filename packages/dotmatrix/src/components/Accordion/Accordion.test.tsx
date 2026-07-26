import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "./Accordion";

describe("Accordion", () => {
  // Content stays mounted whether open or closed (the grid-rows height
  // animation needs a real box to size) — closed state is `aria-hidden`, not
  // DOM removal.
  it("opens one item and closes the previously open one", () => {
    render(
      <Accordion defaultValue="a">
        <AccordionItem value="a" title="Section A">
          Content A
        </AccordionItem>
        <AccordionItem value="b" title="Section B">
          Content B
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Content A")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Section B/ }));
    expect(screen.getByText("Content A").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText("Content B").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
  });

  it("collapses the open item back to none when clicked again", () => {
    render(
      <Accordion defaultValue="a">
        <AccordionItem value="a" title="Section A">
          Content A
        </AccordionItem>
      </Accordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Section A/ }));
    expect(screen.getByText("Content A").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
