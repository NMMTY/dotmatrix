import { describe, expect, it } from "vitest";
import { resolveStyleProps } from "./resolveStyleProps";

describe("resolveStyleProps", () => {
  it("resolves a scale prop to dm-{prefix}-{value}", () => {
    const { className } = resolveStyleProps({ padding: "16" });
    expect(className).toBe("dm-padding-16");
  });

  it("resolves a spacing alias the same way as its pixel key", () => {
    const { className } = resolveStyleProps({ padding: "m" });
    expect(className).toBe("dm-padding-m");
  });

  it("gives side-specific props their own prefix", () => {
    const { className } = resolveStyleProps({ paddingX: "24", marginTop: "8" });
    expect(className.split(" ")).toEqual(
      expect.arrayContaining(["dm-padding-x-24", "dm-margin-top-8"]),
    );
  });

  it("combines multiple style props independently", () => {
    const { className } = resolveStyleProps({
      gap: "16",
      direction: "column",
      alignItems: "center",
    });
    expect(className.split(" ")).toEqual(
      expect.arrayContaining(["dm-gap-16", "dm-direction-column", "dm-align-items-center"]),
    );
  });

  it("only emits a boolean prop's class when the value is true", () => {
    expect(resolveStyleProps({ hidden: true }).className).toBe("dm-hidden");
    expect(resolveStyleProps({ hidden: false }).className).toBe("");
    expect(resolveStyleProps({}).className).toBe("");
  });

  it("passes className through and merges it with resolved classes", () => {
    const { className } = resolveStyleProps({ className: "custom", padding: "8" });
    expect(className.split(" ")).toEqual(expect.arrayContaining(["custom", "dm-padding-8"]));
  });

  it("passes style through untouched", () => {
    const style = { color: "red" };
    expect(resolveStyleProps({ style }).style).toBe(style);
  });

  it("resolves a responsive override to dm-{breakpoint}-{prefix}-{value}", () => {
    const { className } = resolveStyleProps({ m: { direction: "column" }, s: { padding: "8" } });
    expect(className.split(" ")).toEqual(
      expect.arrayContaining(["dm-m-direction-column", "dm-s-padding-8"]),
    );
  });

  it("silently drops a non-responsive prop used inside a breakpoint override", () => {
    // borderColor has no generated per-breakpoint variant (see styles/border.scss).
    const { className } = resolveStyleProps({ m: { borderColor: "strong" } });
    expect(className).toBe("");
  });

  it("puts everything unrecognized into rest, untouched", () => {
    const onClick = () => {};
    const { rest } = resolveStyleProps({
      padding: "8",
      onClick,
      id: "row-1",
      "data-testid": "row",
      "aria-label": "a row",
    });
    expect(rest).toEqual({
      onClick,
      id: "row-1",
      "data-testid": "row",
      "aria-label": "a row",
    });
  });

  it("ignores undefined values instead of emitting dm-x-undefined", () => {
    const { className, rest } = resolveStyleProps({ padding: undefined, custom: undefined });
    expect(className).toBe("");
    expect(rest).toEqual({});
  });
});
