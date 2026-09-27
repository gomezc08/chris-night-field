import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/press`, priority: 1 },
    { url: `${siteUrl}/`, priority: 0.8 },
  ];
}
