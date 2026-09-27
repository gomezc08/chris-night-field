import { ProjectsIcon } from "@sanity/icons/Projects";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ProjectsIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "blurb",
      type: "text",
      rows: 2,
      description: "One or two sentences for the project card.",
    }),
    defineField({ name: "description", type: "portableText" }),
    defineField({
      name: "images",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
    }),
    defineField({ name: "role", type: "string" }),
    defineField({
      name: "stack",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "links",
      type: "array",
      of: [defineArrayMember({ type: "linkItem" })],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
    }),
    orderRankField({ type: "project" }),
  ],
  preview: { select: { title: "title", subtitle: "blurb", media: "images.0" } },
});
