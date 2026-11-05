import { fireEvent, render, screen } from "@testing-library/react";
import { act, createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Fx, type FxHandle } from "./Fx";

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const layer = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-fx-effect]")!;
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
// One step is 1000 / 15 = 66.7 ms: advance a hair past it.
const STEP = 67;

describe("Fx", () => {
  it("renders its children untouched", () => {
    render(
      <Fx effect="blinky">
        <button type="button">Deploy</button>
      </Fx>,
    );
    expect(screen.getByRole("button", { name: "Deploy" })).toBeInTheDocument();
  });

  it("plays on mount: step 0 immediately, then one step per 1/fps", () => {
    const { container } = render(
      <Fx effect="blinky">
        <span>x</span>
      </Fx>,
    );
    expect(layer(container).dataset.fxFrame).toBe("0");
    expect(layer(container).style.opacity).toBe("0.5");
    tick(STEP);
    expect(layer(container).dataset.fxFrame).toBe("1");
    expect(layer(container).style.opacity).toBe("0");
    tick(STEP);
    expect(layer(container).dataset.fxFrame).toBe("2");
    expect(layer(container).style.opacity).toBe("");
  });

  it("runs for the effect's own length, then returns to the natural state and calls onDone", () => {
    const onDone = vi.fn();
    const { container } = render(
      <Fx effect="blinky" onDone={onDone}>
        <span>x</span>
      </Fx>,
    );
    tick(4 * STEP);
    expect(layer(container).dataset.fxFrame).toBeUndefined();
    expect(layer(container).getAttribute("style") ?? "").toBe("");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("each effect has its own length", () => {
    const { container } = render(
      <Fx effect="build-on">
        <span>x</span>
      </Fx>,
    );
    tick(13 * STEP);
    expect(layer(container).dataset.fxFrame).toBe("13");
    tick(STEP);
    expect(layer(container).dataset.fxFrame).toBeUndefined();
  });

  it("frames resamples the sequence", () => {
    const { container } = render(
      <Fx effect="blinky" frames={8}>
        <span>x</span>
      </Fx>,
    );
    tick(2 * STEP);
    expect(layer(container).dataset.fxFrame).toBe("2");
    expect(layer(container).style.opacity).toBe("0");
    tick(6 * STEP);
    expect(layer(container).dataset.fxFrame).toBeUndefined();
  });

  it("honours fps", () => {
    const { container } = render(
      <Fx effect="blinky" fps={10}>
        <span>x</span>
      </Fx>,
    );
    tick(101);
    expect(layer(container).dataset.fxFrame).toBe("1");
  });

  it("stays blank through the delay, then starts at step 0", () => {
    const { container } = render(
      <Fx effect="blinky" delay={500}>
        <span>x</span>
      </Fx>,
    );
    expect(layer(container).dataset.fxFrame).toBe("-1");
    expect(layer(container).style.opacity).toBe("0");
    tick(400);
    expect(layer(container).dataset.fxFrame).toBe("-1");
    tick(110);
    expect(layer(container).dataset.fxFrame).toBe("0");
    expect(layer(container).style.opacity).toBe("0.5");
  });

  it("hover trigger waits for the pointer", () => {
    const { container } = render(
      <Fx effect="glitch" trigger="hover">
        <span>x</span>
      </Fx>,
    );
    expect(layer(container).dataset.fxFrame).toBeUndefined();
    fireEvent.mouseEnter(container.firstElementChild!);
    expect(layer(container).dataset.fxFrame).toBe("0");
  });

  it("focus trigger plays on focus", () => {
    const { container } = render(
      <Fx effect="glitch" trigger="focus">
        <button type="button">go</button>
      </Fx>,
    );
    fireEvent.focus(screen.getByRole("button"));
    expect(layer(container).dataset.fxFrame).toBe("0");
  });

  it("manual trigger plays through the ref", () => {
    const ref = createRef<FxHandle>();
    const { container } = render(
      <Fx ref={ref} effect="blinky" trigger="manual">
        <span>x</span>
      </Fx>,
    );
    expect(layer(container).dataset.fxFrame).toBeUndefined();
    act(() => ref.current?.play());
    expect(layer(container).dataset.fxFrame).toBe("0");
  });

  it("loop trigger repeats instead of stopping", () => {
    const onDone = vi.fn();
    const { container } = render(
      <Fx effect="blinky" trigger="loop" onDone={onDone}>
        <span>x</span>
      </Fx>,
    );
    tick(4 * STEP * 3 + 20);
    expect(onDone).not.toHaveBeenCalled();
    expect(layer(container).dataset.fxFrame).toBeDefined();
  });

  it("repeat plays the given number of times, step 0 included on each pass", () => {
    const onDone = vi.fn();
    const { container } = render(
      <Fx effect="blinky" repeat={2} onDone={onDone}>
        <span>x</span>
      </Fx>,
    );
    tick(4 * STEP + 5);
    expect(onDone).not.toHaveBeenCalled();
    expect(layer(container).dataset.fxFrame).toBe("0");
    tick(4 * STEP);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("stagger starts each direct child one step after the last, blank until its turn", () => {
    const { container } = render(
      <Fx effect="blinky" stagger>
        <span>a</span>
        <span>b</span>
      </Fx>,
    );
    const layers = container.querySelectorAll<HTMLElement>("[data-fx-effect]");
    expect(layers).toHaveLength(2);
    expect(layers[0]!.dataset.fxFrame).toBe("0");
    expect(layers[1]!.dataset.fxFrame).toBe("-1");
    tick(STEP);
    expect(layers[0]!.dataset.fxFrame).toBe("1");
    expect(layers[1]!.dataset.fxFrame).toBe("0");
  });

  it("skips the effect under prefers-reduced-motion", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce"), media: q }));
    const onDone = vi.fn();
    const { container } = render(
      <Fx effect="blinky" onDone={onDone}>
        <span>x</span>
      </Fx>,
    );
    expect(layer(container).dataset.fxFrame).toBeUndefined();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  describe("looks", () => {
    const at = (
      effect: Parameters<typeof Fx>[0]["effect"],
      steps: number,
      children = <span>x</span>,
    ) => {
      const r = render(<Fx effect={effect}>{children}</Fx>);
      tick(steps * STEP);
      return r.container;
    };

    it("glitch cuts the content into offset slices, drawn from copies that assistive tech skips", () => {
      const c = at("glitch", 0, <span>deploy</span>);
      const bands = c.querySelectorAll<HTMLElement>("[inert]");
      expect(bands).toHaveLength(3);
      for (const b of bands) {
        expect(b).toHaveAttribute("aria-hidden", "true");
        expect(b.style.clipPath).toContain("inset(");
        expect(b.style.transform).toContain("translateX(");
      }
      expect(c.querySelectorAll("span:not([aria-hidden])").length).toBeGreaterThan(0);
    });

    it("glitch leaves no copies behind once the burst is over", () => {
      const c = at("glitch", 3);
      expect(c.querySelectorAll("[inert]")).toHaveLength(0);
    });

    it("trail stretches the box from its left with the right edge pinned", () => {
      const c = at("trail", 0);
      expect(layer(c).style.transformOrigin).toMatch(/^0(px)? 50%$/);
      expect(layer(c).style.transform).toMatch(/translateX\(-195%\) scaleX\(2\.4\)/);
      expect(layer(c).style.opacity).toBe("0.2");
    });

    it("stroke-fill hides the content and draws an outline in its place", () => {
      const c = at("stroke-fill", 0);
      expect(layer(c).className).toMatch(/hideContent/);
      expect(layer(c).style.outline).toContain("1px solid");
    });

    it("shuffle swaps the content for a placeholder, then a warning, then hatching", () => {
      const kinds = [0, 2, 4].map((s) => {
        const r = render(
          <Fx effect="shuffle">
            <span>x</span>
          </Fx>,
        );
        tick(s * STEP);
        const kind = r.container.querySelector("[data-kind]")?.getAttribute("data-kind");
        r.unmount();
        return kind;
      });
      expect(kinds).toEqual(["x-box", "warning", "hatch"]);
    });

    it("crash-blink starts as an oversized grey box", () => {
      const c = at("crash-blink", 0);
      expect(layer(c).style.transform).toBe("scale(1.95)");
      expect(layer(c).style.opacity).toBe("0.5");
    });

    it("slide-blink starts below its place and blinks out on step 3", () => {
      expect(layer(at("slide-blink", 0)).style.transform).toBe("translate(0%, 37.5%)");
      expect(layer(at("slide-blink", 2)).style.opacity).toBe("0");
    });

    it("color-flash tints the content with each palette in turn, then lets go", () => {
      const r = render(
        <Fx effect="color-flash" palette={["red", "green"]}>
          <span>x</span>
        </Fx>,
      );
      const tint = () => r.container.querySelector("[data-palette]")?.getAttribute("data-palette");
      expect(tint()).toBe("red");
      tick(STEP);
      expect(tint()).toBe("green");
      tick(STEP);
      expect(tint()).toBe("red");
      tick(2 * STEP);
      expect(r.container.querySelector("[data-palette]")).toBeNull();
    });

    it("build-on masks the content to a 4x4 grid of cells", () => {
      const c = at("build-on", 0);
      expect(layer(c).style.maskImage).toContain("data:image/svg+xml");
    });
  });

  describe("text", () => {
    it("type reveals a string child progressively and keeps the full text for screen readers", () => {
      const { container } = render(<Fx effect="type">Ask me anything.</Fx>);
      const visual = () => layer(container).querySelector("[aria-hidden]")!.textContent;
      expect(visual()?.startsWith("Ask")).toBe(true);
      expect(screen.getByText("Ask me anything.", { selector: "span" })).toBeInTheDocument();
      tick(6 * STEP);
      expect(visual()).toBe("Ask me anything.");
    });

    it("type shows a cursor only when asked", () => {
      const a = render(
        <Fx effect="type" cursor>
          hi
        </Fx>,
      );
      expect(a.container.textContent).toContain("▌");
      a.unmount();
      const b = render(<Fx effect="type">hi</Fx>);
      expect(b.container.textContent).not.toContain("▌");
    });

    it("decode scrambles the string, then resolves to it", () => {
      const { container } = render(<Fx effect="decode">be better</Fx>);
      const visual = () => layer(container).querySelector("[aria-hidden]")!.textContent;
      expect(visual()).not.toBe("be better");
      expect(visual()).toHaveLength(9);
      tick(6 * STEP);
      expect(visual()).toBe("be better");
    });
  });

  it("forwards style props to the root", () => {
    const { container } = render(
      <Fx effect="blinky" marginTop="8">
        <span>x</span>
      </Fx>,
    );
    expect(container.firstElementChild).toHaveClass("dm-margin-top-8");
  });
});
