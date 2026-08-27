import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";

function makeFile(name: string, type: string, size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
  // jsdom doesn't implement object URLs (or canvas/PointerEvent, needed once
  // enableImageEditing routes a file through ImageEditor).
  // Keyed by file name — a constant URL for every file would mask bugs where
  // a component fails to distinguish "still editing the same file" from
  // "moved on to the next one" (see the queued-multi-image test below).
  URL.createObjectURL = vi.fn((file: File) => `blob:mock-${file.name}`);
  URL.revokeObjectURL = vi.fn();
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
  class FakeImage {
    onload: (() => void) | null = null;
    naturalWidth = 40;
    naturalHeight = 20;
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
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("FileUpload", () => {
  it("adds a file selected through the hidden input", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload label="Attachments" onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("report.pdf", "application/pdf");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("100 B")).toBeInTheDocument();
  });

  it("adds files dropped onto the dropzone", () => {
    const onChange = vi.fn();
    render(<FileUpload label="Attachments" onChange={onChange} />);
    const dropzone = screen.getByText(/Drag files here/).closest("button")!;
    const file = makeFile("photo.png", "image/png");
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it("removes a file when its remove button is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload label="Attachments" onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("report.pdf", "application/pdf");
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: "Remove report.pdf" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText("report.pdf")).not.toBeInTheDocument();
  });

  it("rejects files that don't match accept, without adding them", () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" accept="image/*" onChange={onChange} onReject={onReject} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("notes.txt", "text/plain");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "type" }]);
  });

  it("rejects files over maxSize", () => {
    const onReject = vi.fn();
    const { container } = render(<FileUpload label="Photos" maxSize={50} onReject={onReject} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("big.png", "image/png", 500);
    fireEvent.change(input, { target: { files: [file] } });
    expect(onReject).toHaveBeenCalledWith([{ file, reason: "size" }]);
  });

  it("supports a controlled value", () => {
    const existing = makeFile("existing.pdf", "application/pdf");
    render(<FileUpload label="Attachments" value={[existing]} onChange={vi.fn()} />);
    expect(screen.getByText("existing.pdf")).toBeInTheDocument();
  });

  it("routes a new image through ImageEditor before adding it, when enableImageEditing is set", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" enableImageEditing onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("photo.png", "image/png");
    fireEvent.change(input, { target: { files: [file] } });

    // Not added yet — it's queued for editing first.
    expect(onChange).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Edit photo\.png/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const saved = onChange.mock.calls[0]![0] as File[];
    expect(saved).toHaveLength(1);
    expect(saved[0]!.name).toBe("photo.png");
    // A real Blob-backed File came back from ImageEditor's canvas export, not
    // the original.
    expect(saved[0]).not.toBe(file);
  });

  it("keeps the original file when the edit step is cancelled", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" enableImageEditing onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("photo.png", "image/png");
    fireEvent.change(input, { target: { files: [file] } });
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([file]));
  });

  it("resets rotation state for each queued image instead of carrying it over from the previous one", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" enableImageEditing multiple onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const fileA = makeFile("a.png", "image/png");
    const fileB = makeFile("b.png", "image/png");
    fireEvent.change(input, { target: { files: [fileA, fileB] } });

    let dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText(/Edit a\.png/)).toBeInTheDocument());
    const canvasA = dialog.querySelector("canvas")!;
    await waitFor(() => expect(canvasA.width).toBe(40));
    expect(canvasA.height).toBe(20);

    fireEvent.click(within(dialog).getByRole("button", { name: "Rotate" }));
    await waitFor(() => expect(canvasA.width).toBe(20)); // 90°: dimensions swap
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText(/Edit b\.png/)).toBeInTheDocument());
    // Re-queried inside `waitFor`, not captured once beforehand — the actual
    // remount (a fresh `<canvas>` node, once `key` catches up to the new
    // object URL) lands a tick after "Edit b.png" first appears, so a
    // reference grabbed too early would go stale before it updates.
    // If ImageEditor's rotation state had carried over from image A (no
    // remount between queued images), this would stay 20x40 instead.
    await waitFor(() => expect(dialog.querySelector("canvas")!.width).toBe(40));
    expect(dialog.querySelector("canvas")!.height).toBe(20);
  });

  it("merges a second call into the edit queue instead of dropping what's already queued", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" enableImageEditing multiple onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const fileA = makeFile("a.png", "image/png");
    const fileB = makeFile("b.png", "image/png");
    const fileC = makeFile("c.png", "image/png");

    fireEvent.change(input, { target: { files: [fileA, fileB] } });
    // A second call while the first batch is still mid-edit (fileA hasn't
    // been saved/cancelled yet) — fileB must not be dropped from the queue.
    fireEvent.change(input, { target: { files: [fileC] } });

    let dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText(/Edit a\.png/)).toBeInTheDocument());
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText(/Edit b\.png/)).toBeInTheDocument());
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText(/Edit c\.png/)).toBeInTheDocument());
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([fileA, fileB, fileC]));
  });

  it("does not route non-image files through the editor even when enableImageEditing is set", () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUpload label="Files" enableImageEditing onChange={onChange} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("report.pdf", "application/pdf");
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
