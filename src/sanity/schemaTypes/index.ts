import type { SchemaTypeDefinition } from "sanity";

import { accomplishment } from "./accomplishment";
import { education } from "./education";
import { experience } from "./experience";
import { imageWithAlt } from "./imageWithAlt";
import { linkItem } from "./linkItem";
import { links } from "./links";
import { place } from "./place";
import { portableText } from "./portableText";
import { profile } from "./profile";
import { project } from "./project";
import { siteAbout } from "./siteAbout";
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
  siteAbout,
  siteSettings,
  // Lists
  project,
  experience,
  education,
  place,
  skillGroup,
  accomplishment,
];

export const singletonTypes = new Set(["profile", "links", "siteAbout", "siteSettings"]);
