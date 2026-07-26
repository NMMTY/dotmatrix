import { describe, expect, it } from "vitest";
import { dither } from "./dither";
import type { DitherWorkerResponse } from "./dither.worker";
import { WORKER_SOURCE } from "./workerSource.generated";

/**
 * Executes the actual generated WORKER_SOURCE string — the thing runDither
 * really constructs a Worker from at runtime — against a mocked `self`, so
 * this exercises the real bundled output rather than trusting that
 * scripts/build-worker.mjs bundled dither.worker.ts correctly. jsdom has no
 * real Worker global, so this is the closest thing to an end-to-end check
 * available without a real browser.
 */
function runWorkerSource(image: { data: Uint8ClampedArray; width: number; height: number }) {
  let response: DitherWorkerResponse | undefined;
  const self = {
    onmessage: null as ((event: { data: unknown }) => void) | null,
    postMessage: (data: DitherWorkerResponse, _transfer?: Transferable[]) => {
      response = data;
    },
  };
  new Function("self", WORKER_SOURCE)(self);
  self.onmessage?.({ data: { id: 1, image, options: { algorithm: "threshold", levels: 2 } } });
  if (!response) throw new Error("worker source never called postMessage");
  return response;
}

describe("workerSource.generated.ts (the real bundled worker output)", () => {
  it("is non-empty and contains the onmessage handler", () => {
    expect(WORKER_SOURCE.length).toBeGreaterThan(100);
    expect(WORKER_SOURCE).toMatch(/self\.onmessage/);
  });

  it("produces the exact same dithered result as the main-thread dither() for the same input", () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < 16; i++) {
      const o = i * 4;
      const gray = (i * 17) % 256; // varied, deterministic
      data[o] = gray;
      data[o + 1] = gray;
      data[o + 2] = gray;
      data[o + 3] = 255;
    }
    const image = { data, width: 4, height: 4 };

    const expected = dither(image, { algorithm: "threshold", levels: 2 });
    const { id, result } = runWorkerSource(image);

    expect(id).toBe(1);
    expect(Array.from(result.data)).toEqual(Array.from(expected.data));
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
  });
});
