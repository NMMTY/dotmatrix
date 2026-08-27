import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageEditor } from "./ImageEditor";

// jsdom implements neither real image decoding, canvas 2D contexts, nor
// (surprisingly) the PointerEvent constructor at all — `fireEvent.pointerMove`
// silently drops clientX/clientY without it, producing NaN throughout the
// crop math. The crop/resize *geometry* itself is already fully covered by
// cropMath.test.ts as pure functions; these mocks exist only to unlock
// testing the wiring on top of it — that pointer/keyboard handlers actually
// call into that geometry and update the DOM — which cropMath.test.ts can't
// reach.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 200;
  naturalHeight = 100;
  crossOrigin = "";
  #src = "";
  get src() {
    return this.#src;
  }
  set src(value: string) {
    this.#src = value;
    queueMicrotask(() => this.onload?.());
  }
}

class FakePointerEvent extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}

beforeEach(() => {
  vi.stubGlobal("Image", FakeImage);
  vi.stubGlobal("PointerEvent", FakePointerEvent);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    save: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    restore: vi.fn(),
    // biome-ignore lint/suspicious/noExplicitAny: a minimal stub, not a full CanvasRenderingContext2D.
  } as any);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,x");
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
    cb(new Blob(["x"], { type: "image/png" })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function renderLoaded(props: Partial<React.ComponentProps<typeof ImageEditor>> = {}) {
  const result = render(<ImageEditor src="/photo.png" {...props} />);
  await waitFor(() => expect(screen.getByRole("group")).toBeInTheDocument());
  return result;
}

describe("ImageEditor", () => {
  it("shows a loading state before the image resolves", async () => {
    render(<ImageEditor src="/photo.png" />);
    expect(screen.getByText("Loading image…")).toBeInTheDocument();
    // Let the mocked image's load resolve within this test's own act
    // boundary, rather than leaving it dangling for a later test to trip
    // over as an unrelated-looking "not wrapped in act" warning.
    await waitFor(() => expect(screen.getByRole("group")).toBeInTheDocument());
  });

  it("renders the crop overlay once the image loads, sized to the whole image by default", async () => {
    await renderLoaded();
    const overlay = screen.getByRole("group");
    // 200x100 natural size, no rotation — the default aspect ratio is
    // "Free", so the box should start covering the full canvas.
    expect(Number.parseFloat(overlay.style.width)).toBeCloseTo(200, 0);
    expect(Number.parseFloat(overlay.style.height)).toBeCloseTo(100, 0);
  });

  it("hides the crop overlay and aspect-ratio buttons when the crop feature is disabled", async () => {
    render(<ImageEditor src="/photo.png" features={{ crop: false }} />);
    await waitFor(() => expect(screen.queryByText("Loading image…")).not.toBeInTheDocument());
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "1:1" })).not.toBeInTheDocument();
  });

  it("hides the Rotate/Flip buttons per the features prop", async () => {
    await renderLoaded({ features: { rotate: false, flip: false } });
    expect(screen.queryByRole("button", { name: "Rotate" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Flip" })).not.toBeInTheDocument();
  });

  it("moves the crop box on a drag", async () => {
    // A 1:1 box on a 200x100 canvas starts at 100x100 (short-side capped),
    // centered — leaving real room to drag, unlike the "Free" default which
    // already fills the canvas and could only ever clamp back to a no-op.
    await renderLoaded({ aspectRatios: [{ label: "1:1", ratio: 1 }] });
    const overlay = screen.getByRole("group");
    const startLeft = Number.parseFloat(overlay.style.left);
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 50 });
    fireEvent.pointerMove(window, { clientX: 130, clientY: 50 });
    fireEvent.pointerUp(window);
    expect(Number.parseFloat(overlay.style.left)).toBeCloseTo(startLeft + 30, 0);
  });

  it("stops moving once pointerup fires, ignoring further pointermove", async () => {
    await renderLoaded({ aspectRatios: [{ label: "1:1", ratio: 1 }] });
    const overlay = screen.getByRole("group");
    fireEvent.pointerDown(overlay, { clientX: 100, clientY: 50 });
    fireEvent.pointerMove(window, { clientX: 130, clientY: 50 });
    fireEvent.pointerUp(window);
    const settledLeft = Number.parseFloat(overlay.style.left);
    fireEvent.pointerMove(window, { clientX: 160, clientY: 50 });
    expect(Number.parseFloat(overlay.style.left)).toBe(settledLeft);
  });

  it("resizes the crop box from a corner handle", async () => {
    // A 1:1 box on this 200x100 canvas starts at its maximum possible size
    // (100x100, capped by the short side) — so this shrinks it via the se
    // handle instead of growing it, which would have nowhere to go.
    await renderLoaded({ aspectRatios: [{ label: "1:1", ratio: 1 }] });
    const overlay = screen.getByRole("group");
    const startWidth = Number.parseFloat(overlay.style.width);
    const seHandle = overlay.querySelector('[data-corner="se"]')!;
    fireEvent.pointerDown(seHandle, { clientX: 150, clientY: 100 });
    fireEvent.pointerMove(window, { clientX: 120, clientY: 70 });
    fireEvent.pointerUp(window);
    expect(Number.parseFloat(overlay.style.width)).toBeLessThan(startWidth);
    // A corner-handle resize on a locked ratio never distorts the box.
    expect(Number.parseFloat(overlay.style.width)).toBeCloseTo(
      Number.parseFloat(overlay.style.height),
      0,
    );
  });

  it("moves the crop box with arrow keys", async () => {
    await renderLoaded({ aspectRatios: [{ label: "1:1", ratio: 1 }] });
    const overlay = screen.getByRole("group");
    const startLeft = Number.parseFloat(overlay.style.left);
    overlay.focus();
    fireEvent.keyDown(overlay, { key: "ArrowRight" });
    expect(Number.parseFloat(overlay.style.left)).toBeCloseTo(startLeft + 4, 0);
  });

  it("nudges further with Shift held", async () => {
    await renderLoaded({ aspectRatios: [{ label: "1:1", ratio: 1 }] });
    const overlay = screen.getByRole("group");
    const startLeft = Number.parseFloat(overlay.style.left);
    overlay.focus();
    fireEvent.keyDown(overlay, { key: "ArrowRight", shiftKey: true });
    expect(Number.parseFloat(overlay.style.left)).toBeCloseTo(startLeft + 20, 0);
  });

  it("resets the crop box to the new aspect ratio when a preset is clicked", async () => {
    await renderLoaded({ aspectRatios: [{ label: "Free" }, { label: "1:1", ratio: 1 }] });
    fireEvent.click(screen.getByRole("button", { name: "1:1" }));
    const overlay = screen.getByRole("group");
    expect(Number.parseFloat(overlay.style.width)).toBeCloseTo(
      Number.parseFloat(overlay.style.height),
      0,
    );
  });

  it("swaps the canvas's own width/height on a 90° rotation", async () => {
    const { container } = await renderLoaded();
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
    fireEvent.click(screen.getByRole("button", { name: "Rotate" }));
    await waitFor(() => expect(canvas.width).toBe(100));
    expect(canvas.height).toBe(200);
  });

  it("calls onSave with a blob and data URL", async () => {
    const onSave = vi.fn();
    await renderLoaded({ onSave });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    const result = onSave.mock.calls[0]![0];
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.dataUrl).toMatch(/^data:image\/png/);
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    await renderLoaded({ onCancel });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
