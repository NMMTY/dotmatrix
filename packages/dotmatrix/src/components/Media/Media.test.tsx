import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Media } from "./Media";

describe("Media", () => {
  it("renders a plain image src as an <img>", () => {
    render(<Media src="/photo.jpg" alt="A photo" />);
    const img = screen.getByAltText("A photo");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/photo.jpg");
  });

  it("renders a video file src as a native <video>", () => {
    const { container } = render(<Media src="/demo.mp4" alt="A demo recording" />);
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("src", "/demo.mp4");
    expect(video).toHaveAttribute("controls");
  });

  it("renders a youtube URL as an iframe pointed at the no-cookie embed form", () => {
    render(<Media src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" alt="A talk" />);
    const iframe = screen.getByTitle("A talk");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("applies the aspect ratio to the wrapper, defaulting to 16 / 9", () => {
    const { container } = render(<Media src="/photo.jpg" alt="A photo" />);
    expect((container.firstChild as HTMLElement).style.aspectRatio).toBe("16 / 9");
  });
});
