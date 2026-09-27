import { TagsIcon } from "@sanity/icons/Tags";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

export const skillGroup = defineType({
  name: "skillGroup",
  title: "Skill group",
  type: "document",
  icon: TagsIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "e.g. \"Languages\", \"Infra\", \"ML\".",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    orderRankField({ type: "skillGroup" }),
  ],
  preview: {
    select: { title: "label", items: "items" },
    prepare: ({ title, items }: { title?: string; items?: string[] }) => ({
      title,
      subtitle: items?.join(", "),
    }),
  },
});
