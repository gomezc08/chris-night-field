import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Sanity CDN URL that respects the editor's crop and hotspot. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("crop");
}
