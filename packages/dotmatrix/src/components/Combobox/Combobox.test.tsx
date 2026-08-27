import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "us", label: "United States" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan", disabled: true },
];

describe("Combobox", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Combobox label="Country" options={OPTIONS} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows the selected option's label on the trigger", () => {
    render(<Combobox label="Country" options={OPTIONS} defaultValue="fr" />);
    expect(screen.getByRole("button", { name: /France/ })).toBeInTheDocument();
  });

  it("opens the listbox and selects an option on click", async () => {
    const onChange = vi.fn();
    render(<Combobox label="Country" options={OPTIONS} defaultValue="fr" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("option", { name: "United States" }));
    expect(onChange).toHaveBeenCalledWith("us");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /United States/ })).toBeInTheDocument(),
    );
  });

  it("filters options as the search field is typed into", async () => {
    render(<Combobox label="Country" options={OPTIONS} defaultValue="fr" />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    const search = await screen.findByRole("combobox");

    fireEvent.change(search, { target: { value: "united" } });
    expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "France" })).not.toBeInTheDocument();
  });

  it("shows the empty message when nothing matches", async () => {
    render(<Combobox label="Country" options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    const search = await screen.findByRole("combobox");
    fireEvent.change(search, { target: { value: "nowhere" } });
    expect(screen.getByText("No matches.")).toBeInTheDocument();
  });

  it("marks the currently selected option, not the others", async () => {
    render(<Combobox label="Country" options={OPTIONS} defaultValue="fr" />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    expect(screen.getByRole("option", { name: /France/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "United States" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("does not commit a disabled option on click", async () => {
    const onChange = vi.fn();
    render(<Combobox label="Country" options={OPTIONS} defaultValue="fr" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /France/ }));
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("option", { name: /Japan/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("commits the arrow-navigated option on Enter", async () => {
    const onChange = vi.fn();
    render(<Combobox label="Country" options={OPTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const search = await screen.findByRole("combobox");

    // Starts active on index 0 ("United States"); one ArrowDown moves to
    // index 1 ("France") — Enter should commit that, not the first option.
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("fr");
  });
});
