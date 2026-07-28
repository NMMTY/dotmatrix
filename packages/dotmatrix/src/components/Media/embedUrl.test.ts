import { describe, expect, it } from "vitest";
import { detectMediaKind, toEmbedUrl } from "./embedUrl";

describe("detectMediaKind", () => {
  it("recognizes youtube.com/watch URLs", () => {
    expect(detectMediaKind("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("youtube");
  });

  it("recognizes youtu.be short links", () => {
    expect(detectMediaKind("https://youtu.be/dQw4w9WgXcQ")).toBe("youtube");
  });

  it("recognizes an already-embed youtube URL", () => {
    expect(detectMediaKind("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("youtube");
  });

  it("recognizes vimeo URLs", () => {
    expect(detectMediaKind("https://vimeo.com/76979871")).toBe("vimeo");
  });

  it("recognizes direct video file URLs", () => {
    expect(detectMediaKind("https://example.com/demo.mp4")).toBe("video");
    expect(detectMediaKind("https://example.com/demo.webm?cache=1")).toBe("video");
  });

  it("falls back to image for anything else", () => {
    expect(detectMediaKind("https://example.com/photo.jpg")).toBe("image");
    expect(detectMediaKind("/local/screenshot.png")).toBe("image");
  });
});

describe("toEmbedUrl", () => {
  it("rewrites a youtube watch URL to the no-cookie embed form", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("rewrites a youtu.be short link the same way", () => {
    expect(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ", "youtube")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("rewrites a vimeo page URL to the player embed form", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871", "vimeo")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  it("passes video/image URLs through unchanged", () => {
    expect(toEmbedUrl("https://example.com/demo.mp4", "video")).toBe(
      "https://example.com/demo.mp4",
    );
    expect(toEmbedUrl("https://example.com/photo.jpg", "image")).toBe(
      "https://example.com/photo.jpg",
    );
  });
});
