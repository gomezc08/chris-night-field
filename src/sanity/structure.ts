import { BookIcon } from "@sanity/icons/Book";
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { LinkIcon } from "@sanity/icons/Link";
import { PinIcon } from "@sanity/icons/Pin";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { StarIcon } from "@sanity/icons/Star";
import { TagsIcon } from "@sanity/icons/Tags";
import { UserIcon } from "@sanity/icons/User";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

// Singletons open straight into their one document; lists get drag-and-drop ordering.
export const structure: StructureResolver = (S, context) => {
  const singleton = (type: string, title: string, icon: typeof UserIcon) =>
    S.listItem()
      .title(title)
      .id(type)
      .icon(icon)
      .child(S.document().schemaType(type).documentId(type).title(title));

  const orderable = (type: string, title: string, icon: typeof UserIcon) =>
    orderableDocumentListDeskItem({ type, title, icon, S, context });

  return S.list()
    .title("Content")
    .items([
      singleton("profile", "About me", UserIcon),
      orderable("project", "Projects", ProjectsIcon),
      orderable("experience", "Experience", CaseIcon),
      orderable("education", "Education", BookIcon),
      orderable("skillGroup", "Skills and stack", TagsIcon),
      orderable("place", "Places I've lived", PinIcon),
      singleton("links", "Links", LinkIcon),
      orderable("accomplishment", "Accomplishments", StarIcon),
      S.divider(),
      singleton("siteSettings", "Site settings", CogIcon),
    ]);
};
