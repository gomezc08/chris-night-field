import type { SchemaTypeDefinition } from "sanity";

import { credits } from "./credits";
import { education } from "./education";
import { experience } from "./experience";
import { imageWithAlt } from "./imageWithAlt";
import { linkItem } from "./linkItem";
import { links } from "./links";
import { place } from "./place";
import { portableText } from "./portableText";
import { profile } from "./profile";
import { project } from "./project";
import { siteSettings } from "./siteSettings";
import { skillGroup } from "./skillGroup";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Shared
  portableText,
  linkItem,
  imageWithAlt,
  // Singletons
  profile,
  links,
  credits,
  siteSettings,
  // Lists
  project,
  experience,
  education,
  place,
  skillGroup,
];

export const singletonTypes = new Set(["profile", "links", "credits", "siteSettings"]);
