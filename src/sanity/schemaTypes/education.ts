import { BookIcon } from "@sanity/icons/Book";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  icon: BookIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "school",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "degree", type: "string" }),
    defineField({ name: "field", title: "Field of study", type: "string" }),
    defineField({ name: "startDate", title: "Start date", type: "date" }),
    defineField({ name: "endDate", title: "End date", type: "date" }),
    defineField({ name: "honors", type: "string" }),
    defineField({
      name: "publications",
      type: "array",
      of: [
        defineArrayMember({
          name: "publication",
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "venue", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "title", subtitle: "venue" } },
        }),
      ],
    }),
    orderRankField({ type: "education" }),
  ],
  preview: { select: { title: "school", subtitle: "degree" } },
});
