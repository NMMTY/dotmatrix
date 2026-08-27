import { describe, expect, it } from "vitest";
import { formatFileSize, matchesAccept, partitionFiles } from "./fileValidation";

function makeFile(name: string, type: string, size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("matchesAccept", () => {
  it("matches everything when accept is omitted or blank", () => {
    expect(matchesAccept(makeFile("a.png", "image/png"), undefined)).toBe(true);
    expect(matchesAccept(makeFile("a.png", "image/png"), "  ")).toBe(true);
  });

  it("matches an exact MIME type", () => {
    expect(matchesAccept(makeFile("a.png", "image/png"), "image/png")).toBe(true);
    expect(matchesAccept(makeFile("a.jpg", "image/jpeg"), "image/png")).toBe(false);
  });

  it("matches a type/* wildcard", () => {
    expect(matchesAccept(makeFile("a.png", "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(makeFile("a.mp4", "video/mp4"), "image/*")).toBe(false);
  });

  it("matches a file extension, case-insensitively", () => {
    expect(matchesAccept(makeFile("a.PDF", "application/pdf"), ".pdf")).toBe(true);
    expect(matchesAccept(makeFile("a.pdf", "application/pdf"), ".PDF")).toBe(true);
    expect(matchesAccept(makeFile("a.txt", "text/plain"), ".pdf")).toBe(false);
  });

  it("matches any one of a comma-separated list", () => {
    const accept = "image/png, .pdf, video/*";
    expect(matchesAccept(makeFile("a.png", "image/png"), accept)).toBe(true);
    expect(matchesAccept(makeFile("a.pdf", "application/pdf"), accept)).toBe(true);
    expect(matchesAccept(makeFile("a.mov", "video/quicktime"), accept)).toBe(true);
    expect(matchesAccept(makeFile("a.txt", "text/plain"), accept)).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("shows bytes under 1 KB with no decimal", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("shows a decimal for sub-10 values, none for 10+", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(15 * 1024)).toBe("15 KB");
  });

  it("scales up through MB/GB", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatFileSize(2 * 1024 * 1024 * 1024)).toBe("2 GB");
  });
});

describe("partitionFiles", () => {
  it("accepts everything when no constraints are given", () => {
    const files = [makeFile("a.png", "image/png"), makeFile("b.jpg", "image/jpeg")];
    const { accepted, rejected } = partitionFiles([], files, {});
    expect(accepted).toEqual(files);
    expect(rejected).toHaveLength(0);
  });

  it("rejects files that don't match accept", () => {
    const files = [makeFile("a.png", "image/png"), makeFile("b.txt", "text/plain")];
    const { accepted, rejected } = partitionFiles([], files, { accept: "image/*" });
    expect(accepted).toEqual([files[0]]);
    expect(rejected).toEqual([{ file: files[1], reason: "type" }]);
  });

  it("rejects files over maxSize", () => {
    const small = makeFile("a.png", "image/png", 100);
    const big = makeFile("b.png", "image/png", 10_000);
    const { accepted, rejected } = partitionFiles([], [small, big], { maxSize: 1000 });
    expect(accepted).toEqual([small]);
    expect(rejected).toEqual([{ file: big, reason: "size" }]);
  });

  it("rejects files once maxFiles (counting what's already there) is reached", () => {
    const existing = [makeFile("existing.png", "image/png")];
    const incoming = [makeFile("a.png", "image/png"), makeFile("b.png", "image/png")];
    const { accepted, rejected } = partitionFiles(existing, incoming, { maxFiles: 2 });
    expect(accepted).toEqual([incoming[0]]);
    expect(rejected).toEqual([{ file: incoming[1], reason: "count" }]);
  });

  it("evaluates type before size before count, per file", () => {
    const existing: File[] = [];
    const badType = makeFile("a.txt", "text/plain", 5000);
    const { rejected } = partitionFiles(existing, [badType], {
      accept: "image/*",
      maxSize: 100,
      maxFiles: 0,
    });
    expect(rejected).toEqual([{ file: badType, reason: "type" }]);
  });
});
