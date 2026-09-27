import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader that resizes on Sanity's CDN instead of Vercel's image
 * optimizer, which keeps us clear of the Hobby plan's transformation quota.
 * If the source URL has a fixed w/h crop, the height is scaled to keep the ratio.
 */
export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  if (url.hostname !== "cdn.sanity.io") return src;

  const w = Number(url.searchParams.get("w"));
  const h = Number(url.searchParams.get("h"));
  if (w && h) url.searchParams.set("h", String(Math.round((h * width) / w)));
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
  return url.toString();
}
