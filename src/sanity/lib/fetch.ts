import type { QueryParams } from "next-sanity";

import { client } from "./client";

// Time-based fallback in case a webhook is missed.
export const REVALIDATE_SECONDS = 60;

/**
 * Cached, tagged fetch. Tags are Sanity document type names so the webhook
 * can invalidate everything that depends on the type that was published.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags,
}: {
  query: QueryString;
  params?: QueryParams;
  tags: string[];
}) {
  return client.fetch(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags },
  });
}
