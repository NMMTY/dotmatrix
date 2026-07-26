import { type DitherOptions, dither, type RasterImage } from "./dither";
import type { DitherWorkerRequest, DitherWorkerResponse } from "./dither.worker";
import { WORKER_SOURCE } from "./workerSource.generated";

let worker: Worker | null | undefined; // undefined = not yet attempted
const pending = new Map<number, (result: RasterImage) => void>();
let nextId = 0;

// A generous but finite ceiling: real dithering work finishes in well under
// a second even for large images, so anything past this means the worker
// itself is broken (never actually loaded, CSP-blocked, etc.), not slow.
const WORKER_TIMEOUT_MS = 4000;

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof Worker === "undefined" || typeof Blob === "undefined") {
      worker = null;
      return worker;
    }
    // Built from an inlined source string via a Blob URL, not
    // `new Worker(new URL("./dither.worker.ts", import.meta.url))` — that
    // only resolves when the same bundler processes both files in one
    // build, which doesn't hold once this package is built once and
    // consumed by an arbitrary downstream bundler (confirmed live: Vite
    // rewrote it to an absolute dist/assets/ path, unreachable from a
    // consumer's node_modules). See scripts/build-worker.mjs.
    const blob = new Blob([WORKER_SOURCE], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const instance = new Worker(url);
    URL.revokeObjectURL(url); // safe once the Worker has been constructed from it
    instance.onmessage = (event: MessageEvent<DitherWorkerResponse>) => {
      const resolve = pending.get(event.data.id);
      if (!resolve) return;
      pending.delete(event.data.id);
      resolve(event.data.result);
    };
    // If the worker crashes outright, fall back permanently rather than
    // hanging every future call's Promise forever. A single broken *request*
    // (worker constructs fine but never replies) is handled separately, by
    // the per-call timeout below — onerror alone wouldn't catch that case.
    instance.onerror = () => {
      worker = null;
    };
    worker = instance;
  } catch {
    worker = null;
  }
  return worker;
}

/**
 * Runs {@link dither} off the main thread when possible, falling back to
 * synchronous execution when Workers aren't available, fail to start, or
 * never respond (bounded by {@link WORKER_TIMEOUT_MS}, since a silently
 * dropped request would otherwise hang forever).
 *
 * Consumes `image`: its buffer is transferred (not copied) for zero-copy
 * performance, detaching it on the caller's side — only pass an image you
 * don't need afterward (a fresh `ctx.getImageData()`, never a held value).
 */
export async function runDither(
  image: RasterImage,
  options: DitherOptions = {},
): Promise<RasterImage> {
  const instance = getWorker();
  if (!instance) return dither(image, options);

  return new Promise((resolve) => {
    const id = nextId++;
    let settled = false;
    const settle = (result: RasterImage) => {
      if (settled) return;
      settled = true;
      pending.delete(id);
      resolve(result);
    };

    // `image.data.buffer` gets transferred (detached) below, so the timeout
    // path — the worker never replies at all — needs its own independent
    // copy to still have real data to fall back on synchronously.
    const retained: RasterImage = {
      data: Uint8ClampedArray.from(image.data),
      width: image.width,
      height: image.height,
    };

    const timer = setTimeout(() => settle(dither(retained, options)), WORKER_TIMEOUT_MS);
    pending.set(id, (result) => {
      clearTimeout(timer);
      settle(result);
    });

    try {
      instance.postMessage({ id, image, options } satisfies DitherWorkerRequest, [
        image.data.buffer,
      ]);
    } catch {
      // postMessage itself threw (e.g. structured-clone rejected something)
      // — the buffer wasn't actually detached in that case, but `retained`
      // is equally valid data and simpler than branching on which copy to use.
      clearTimeout(timer);
      settle(dither(retained, options));
    }
  });
}
