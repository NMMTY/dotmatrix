import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("shows the clear button only once there's a value, and clears on click", () => {
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <SearchInput label="Search" value={value} onChange={(e) => setValue(e.target.value)} />
      );
    }
    render(<Harness />);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    const input = screen.getByLabelText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "bitmap" } });
    expect(input.value).toBe("bitmap");

    const clearButton = screen.getByRole("button", { name: "Clear search" });
    fireEvent.click(clearButton);
    expect(input.value).toBe("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});
