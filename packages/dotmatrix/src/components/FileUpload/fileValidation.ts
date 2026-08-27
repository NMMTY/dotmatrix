/**
 * Pure, DOM-free helpers for `FileUpload` — matching a `File` against an
 * `accept` pattern and formatting a byte count, both testable without
 * constructing real `File`/`Blob` instances in a browser-like environment.
 */

export type RejectionReason = "type" | "size" | "count";

export interface Rejection {
  file: File;
  reason: RejectionReason;
}

/** Mirrors the native `<input accept>` matching rules: extensions, exact MIME types, and `type/*` wildcards. */
export function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept?.trim()) return true;
  const patterns = accept
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) return name.endsWith(pattern);
    if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** `1536` → `"1.5 KB"`. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || Number.isInteger(value) ? 0 : 1)} ${UNITS[exponent]}`;
}

/** Splits `incoming` into what can join `existing` and what can't, given `accept`/`maxSize`/`maxFiles`. */
export function partitionFiles(
  existing: File[],
  incoming: File[],
  { accept, maxSize, maxFiles }: { accept?: string; maxSize?: number; maxFiles?: number },
): { accepted: File[]; rejected: Rejection[] } {
  const accepted: File[] = [];
  const rejected: Rejection[] = [];
  let total = existing.length;

  for (const file of incoming) {
    if (!matchesAccept(file, accept)) {
      rejected.push({ file, reason: "type" });
      continue;
    }
    if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({ file, reason: "size" });
      continue;
    }
    if (maxFiles !== undefined && total >= maxFiles) {
      rejected.push({ file, reason: "count" });
      continue;
    }
    accepted.push(file);
    total += 1;
  }

  return { accepted, rejected };
}
