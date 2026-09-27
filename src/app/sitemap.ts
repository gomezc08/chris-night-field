import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/press`, priority: 1 },
    { url: `${siteUrl}/`, priority: 0.8 },
    { url: `${siteUrl}/field`, priority: 0.8 },
    { url: `${siteUrl}/about`, priority: 0.6 },
  ];
}
