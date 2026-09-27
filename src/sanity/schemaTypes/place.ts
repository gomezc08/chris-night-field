import { PinIcon } from "@sanity/icons/Pin";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

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
    defineField({ name: "years", type: "string", description: "e.g. \"2019–2023\"." }),
    defineField({ name: "photo", type: "imageWithAlt" }),
    defineField({
      name: "note",
      type: "text",
      rows: 3,
      description: "One to three sentences.",
      validation: (rule) => rule.max(400),
    }),
    orderRankField({ type: "place" }),
  ],
  preview: { select: { title: "city", subtitle: "years", media: "photo" } },
});
