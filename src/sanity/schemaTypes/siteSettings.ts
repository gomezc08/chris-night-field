import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "scoreboardName",
      title: "Scoreboard name",
      type: "string",
      initialValue: "GOMEZ FC",
    }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string" }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200 × 630 works best.",
    }),
    defineField({
      name: "ambientTrack",
      title: "Ambient track",
      type: "file",
      options: { accept: "audio/*" },
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
