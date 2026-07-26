import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const OPTIONS = [
  { value: "us", label: "United States" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan", disabled: true },
];

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select label="Country" options={OPTIONS} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows the selected option's label on the trigger", () => {
    render(<Select label="Country" options={OPTIONS} defaultValue="fr" />);
    expect(screen.getByRole("button", { name: /France/ })).toBeInTheDocument();
  });

  it("opens the menu and selects an option on click", async () => {
    const onChange = vi.fn();
    render(<Select label="Country" options={OPTIONS} defaultValue="fr" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("menuitem", { name: "United States" }));
    expect(onChange).toHaveBeenCalledWith("us");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /United States/ })).toBeInTheDocument(),
    );
  });

  it("marks the currently selected option with a checkmark, not the others", async () => {
    render(<Select label="Country" options={OPTIONS} defaultValue="fr" />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());

    const franceItem = screen.getByRole("menuitem", { name: /France/ });
    const usItem = screen.getByRole("menuitem", { name: "United States" });
    expect(franceItem.querySelector("svg")).toBeInTheDocument();
    expect(usItem.querySelector("svg")).not.toBeInTheDocument();
  });

  it("disables an option per its own `disabled` flag", async () => {
    render(<Select label="Country" options={OPTIONS} defaultValue="fr" />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("menu")).toBeInTheDocument());
    expect(screen.getByRole("menuitem", { name: /Japan/ })).toBeDisabled();
  });
});
