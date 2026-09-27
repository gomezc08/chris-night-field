import { CaseIcon } from "@sanity/icons/Case";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  icon: CaseIcon,
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
    orderRankOrdering,
  ],
  fields: [
    defineField({
      name: "company",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      description: "Leave empty if this is your current role.",
    }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "summary", type: "portableText" }),
    defineField({ name: "logo", type: "imageWithAlt" }),
    // Drag order in Studio only breaks ties between roles with the same start date.
    orderRankField({ type: "experience" }),
  ],
  preview: {
    select: { title: "role", subtitle: "company", media: "logo" },
  },
});
