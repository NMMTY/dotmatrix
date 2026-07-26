import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders no remove control without onRemove", () => {
    render(<Chip>tag</Chip>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("wires the remove button to onRemove with the given label", () => {
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} removeLabel="Remove tag">
        tag
      </Chip>,
    );
    const btn = screen.getByRole("button", { name: "Remove tag" });
    btn.click();
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
