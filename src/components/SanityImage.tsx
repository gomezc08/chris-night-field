import Image from "next/image";

import { urlFor } from "@/sanity/lib/image";

export type SanityImageData = {
  asset?: { _ref: string } | null;
  crop?: unknown;
  hotspot?: unknown;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  lqip?: string | null;
} | null;

type Props = {
  image: SanityImageData;
  /** Rendered width in CSS pixels. */
  width: number;
  /** Crop to this aspect ratio (width / height). Defaults to the original. */
  aspect?: number;
  sizes?: string;
  preload?: boolean;
  className?: string;
};

/** next/image backed by Sanity's CDN, honoring the editor's crop and hotspot. */
export function SanityImage({ image, width, aspect, sizes, preload, className }: Props) {
  if (!image?.asset) return null;

  const ratio = aspect ?? (image.width && image.height ? image.width / image.height : 1);
  const height = Math.round(width / ratio);
  // Imprecise types from the query projection; urlFor only needs asset/crop/hotspot.
  const src = urlFor(image as Parameters<typeof urlFor>[0])
    .width(width)
    .height(height)
    .url();

  return (
    <Image
      src={src}
      alt={image.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes ?? `${width}px`}
      preload={preload}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip ?? undefined}
      className={className}
    />
  );
}
