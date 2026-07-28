import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;

// Blocks the obvious loopback/private-network hosts so this can't be used to
// probe the server's own internal network — not exhaustive (DNS rebinding
// could still slip past a hostname-only check), but this proxy only exists
// to let the docs Playground preview arbitrary *public* demo images, not to
// front untrusted traffic.
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "0.0.0.0" || host === "::1") return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  return false;
}

/**
 * Fetches an external image server-side and re-serves it same-origin with a
 * permissive CORS header. Exists solely so the docs Playground can dither/
 * halftone an arbitrary image URL a visitor pastes in — a browser can only
 * read canvas pixel data back out for images the server grants CORS on, and
 * most hotlinked images grant none. Routing through here makes *this site*
 * the origin the browser sees, which sidesteps that restriction for the
 * preview without asking the source server for anything.
 */
export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Only http(s) URLs are allowed" }, { status: 400 });
  }
  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "This host is not allowed" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(parsed, { signal: controller.signal, redirect: "follow" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch the image" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: `Upstream responded ${upstream.status}` }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "URL did not return an image" }, { status: 415 });
  }

  const contentLength = Number(upstream.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  const buffer = await upstream.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
