import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";

export const links = defineType({
  name: "links",
  title: "Links",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({ name: "github", title: "GitHub", type: "url" }),
    defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
    defineField({
      name: "otherLinks",
      title: "Other links",
      type: "array",
      of: [defineArrayMember({ type: "linkItem" })],
    }),
    defineField({
      name: "resume",
      title: "Resume (PDF)",
      type: "file",
      options: { accept: "application/pdf" },
      description: "Replacing this file updates the \"Download resume\" button.",
    }),
  ],
  preview: { prepare: () => ({ title: "Links" }) },
});
