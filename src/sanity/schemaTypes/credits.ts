import { HeartIcon } from "@sanity/icons/Heart";
import { defineArrayMember, defineField, defineType } from "sanity";

export const credits = defineType({
  name: "credits",
  title: "Credits",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "tracks",
      title: "Soundtrack",
      type: "array",
      of: [
        defineArrayMember({
          name: "track",
          type: "object",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "artist", type: "string" }),
            defineField({
              name: "audioFile",
              title: "Audio file",
              type: "file",
              options: { accept: "audio/*" },
            }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: { select: { title: "title", subtitle: "artist" } },
        }),
      ],
    }),
    defineField({ name: "thanks", type: "portableText" }),
    defineField({
      name: "builtWith",
      title: "Built with",
      type: "string",
    }),
  ],
  preview: { prepare: () => ({ title: "Credits" }) },
});
