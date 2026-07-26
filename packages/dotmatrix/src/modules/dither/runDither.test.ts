import { describe, expect, it } from "vitest";
import { dither } from "./dither";
import { runDither } from "./runDither";

describe("runDither", () => {
  it("falls back to the synchronous algorithm when Workers aren't available (e.g. jsdom, SSR)", async () => {
    expect(typeof Worker).toBe("undefined");

    const data = new Uint8ClampedArray(2 * 2 * 4);
    for (let i = 0; i < 4; i++) {
      data[i * 4] = 160;
      data[i * 4 + 1] = 160;
      data[i * 4 + 2] = 160;
      data[i * 4 + 3] = 255;
    }
    const image = { data, width: 2, height: 2 };
    const expected = dither(image, { algorithm: "threshold", levels: 2 });

    const result = await runDither(
      { data: data.slice(), width: 2, height: 2 },
      { algorithm: "threshold", levels: 2 },
    );
    expect(result.data).toEqual(expected.data);
  });
});
