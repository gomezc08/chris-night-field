import { defineField, defineType } from "sanity";

// Image with hotspot and required alt text, used everywhere a photo appears.
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe the image for screen readers.",
      validation: (rule) => rule.required(),
    }),
  ],
});
