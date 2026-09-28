import { PinIcon } from "@sanity/icons/Pin";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

export const place = defineType({
  name: "place",
  title: "Place I've lived",
  type: "document",
  icon: PinIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "city",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "region", type: "string", description: "State or country." }),
    defineField({ name: "years", type: "string", description: 'e.g. "2019–2023".' }),
    defineField({
      name: "photos",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
      description: "A few photos. The first one is the cover; drag to reorder.",
    }),
    // The original single photo. Shown only on places that still have one; the site uses it
    // as the cover until Photos has images.
    defineField({
      name: "photo",
      title: "Photo (old)",
      type: "imageWithAlt",
      description: "Replaced by Photos above. Add it there, then remove it here.",
      hidden: ({ document }) => !document?.photo,
    }),
    defineField({
      name: "note",
      type: "text",
      rows: 3,
      description: "One to three sentences.",
      validation: (rule) => rule.max(400),
    }),
    orderRankField({ type: "place" }),
  ],
  preview: {
    select: { title: "city", subtitle: "years", cover: "photos.0", old: "photo" },
    prepare: ({ title, subtitle, cover, old }) => ({ title, subtitle, media: cover ?? old }),
  },
});
