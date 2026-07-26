/// <reference lib="webworker" />
import { type DitherOptions, dither, type RasterImage } from "./dither";

export interface DitherWorkerRequest {
  id: number;
  image: RasterImage;
  options: DitherOptions;
}

export interface DitherWorkerResponse {
  id: number;
  result: RasterImage;
}

// A plain postMessage protocol rather than a library like Comlink: the
// surface here is one function call, and pulling in a dependency (with its
// own bundling implications for a worker entry point specifically) isn't
// worth it for that.
self.onmessage = (event: MessageEvent<DitherWorkerRequest>) => {
  const { id, image, options } = event.data;
  const result = dither(image, options);
  // The result's backing buffer is transferred, not copied — cheap even for
  // large images, and safe because nothing on this side reads `image`/
  // `result` again afterwards.
  (self as unknown as Worker).postMessage({ id, result } satisfies DitherWorkerResponse, [
    result.data.buffer,
  ]);
};
