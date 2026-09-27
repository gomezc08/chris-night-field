import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Fetches only happen at build and revalidation time, so skip the CDN and always read fresh data.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});
