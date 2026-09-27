import { StarIcon } from "@sanity/icons/Star";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const accomplishment = defineType({
  name: "accomplishment",
  title: "Accomplishment",
  type: "document",
  icon: StarIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "e.g. \"1st place, HackMIT\" or \"NCAA All-Conference\".",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "organization",
      title: "Organization or event",
      type: "string",
    }),
    defineField({
      name: "date",
      type: "string",
      description: "Free text, e.g. \"2025\" or \"Spring 2024\".",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "One or two sentences.",
    }),
    defineField({
      name: "url",
      title: "Link",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    orderRankField({ type: "accomplishment" }),
  ],
  preview: { select: { title: "title", subtitle: "organization" } },
});
