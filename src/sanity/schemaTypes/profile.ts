import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

export const profile = defineType({
  name: "profile",
  title: "About me",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headline",
      type: "string",
      description: "Short line shown under your name.",
    }),
    defineField({ name: "photo", type: "imageWithAlt" }),
    defineField({ name: "bio", type: "portableText" }),
    defineField({
      name: "email",
      type: "string",
      description: "Public. The dataset is readable by anyone.",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "location",
      type: "string",
      description: "City-level only, e.g. \"Austin, TX\".",
    }),
    defineField({
      name: "contactNote",
      title: "Contact note",
      type: "string",
      description: "e.g. \"Best way to reach me\".",
    }),
  ],
  preview: { select: { title: "name", subtitle: "headline", media: "photo" } },
});
