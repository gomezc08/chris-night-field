import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineField, defineType } from "sanity";

/** The long-form "About" page reached from the start screen: who Chris is and what this site is. */
export const siteAbout = defineType({
  name: "siteAbout",
  title: "About (start screen)",
  type: "document",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "heading",
      type: "string",
      initialValue: "About",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      type: "portableText",
      description:
        "Your story in your own words. Use Enter for new paragraphs, and headings or bullets as you like.",
    }),
  ],
  preview: { select: { title: "heading" } },
});
