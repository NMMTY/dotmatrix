import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "./Tabs";

describe("Tabs", () => {
  it("switches panels on click and updates aria-selected", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
      </Tabs>,
    );
    // The inactive panel is unmounted, not just visually hidden.
    expect(screen.getByText("Panel A")).toBeVisible();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Panel B")).toBeVisible();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("moves focus and activates the next tab with ArrowRight, wrapping at the end", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
      </Tabs>,
    );
    const tabA = screen.getByRole("tab", { name: "A" });
    const tabB = screen.getByRole("tab", { name: "B" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(tabB).toHaveFocus();
    expect(tabB).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(tabB, { key: "ArrowRight" });
    expect(tabA).toHaveFocus();
  });

  it("only the selected tab is in the natural tab order (roving tabindex)", () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("tabIndex", "0");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("tabIndex", "-1");
  });
});
