import type { Metadata } from "next";

import { urlFor } from "@/sanity/lib/image";
import type { PRESS_QUERY_RESULT } from "@/sanity/types";

type Content = Pick<PRESS_QUERY_RESULT, "profile" | "siteSettings">;

/** Shared title, description, and share image from Site settings (falling back to the profile). */
export function siteMetadata({ profile, siteSettings }: Content, path: string): Metadata {
  const title = siteSettings?.seoTitle ?? profile?.name ?? undefined;
  const description = siteSettings?.seoDescription ?? profile?.headline ?? undefined;
  const image = siteSettings?.ogImage?.asset
    ? {
        url: urlFor(siteSettings.ogImage).width(1200).height(630).url(),
        width: 1200,
        height: 630,
        alt: siteSettings.ogImage.alt ?? title,
      }
    : undefined;

  return {
    title,
    description,
    // /press is the canonical content page; the scene is an alternate view of it.
    alternates: { canonical: "/press" },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}
