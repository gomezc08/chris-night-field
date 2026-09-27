import type { Metadata } from "next";

import { NightField } from "@/components/field/NightField";
import { BackButton, ProfileButton } from "@/components/nav/NavButtons";
import { siteMetadata } from "@/lib/metadata";
import { PlacesPanel } from "@/components/panels/PlacesPanel";
import { ProjectsPanel } from "@/components/panels/ProjectsPanel";
import {
  AboutPanel,
  AccomplishmentsPanel,
  EducationPanel,
  ExperiencePanel,
  LinksPanel,
  SkillsPanel,
} from "@/components/panels/StaticPanels";
import type { SpotKey } from "@/scene/constants";
import { sanityFetch } from "@/sanity/lib/fetch";
import { CONTENT_TAGS, PRESS_QUERY } from "@/sanity/queries";

import styles from "./page.module.css";

async function getContent() {
  return sanityFetch({ query: PRESS_QUERY, tags: CONTENT_TAGS });
}

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(await getContent(), "/field");
}

export default async function FieldPage() {
  const data = await getContent();

  // Which content each spot on the field opens.
  const panels: Record<SpotKey, React.ReactNode> = {
    bag: <AccomplishmentsPanel accomplishments={data.accomplishments} />,
    goalR: <ProjectsPanel projects={data.projects} />,
    goalL: <LinksPanel links={data.links} />,
    score: <ExperiencePanel experience={data.experience} />,
    board: <EducationPanel education={data.education} />,
    flag: <PlacesPanel places={data.places} />,
    ballbag: <SkillsPanel skillGroups={data.skillGroups} />,
    stands: <AboutPanel profile={data.profile} />,
  };

  return (
    <main className={styles.main}>
      <h1 className="sr-only">{data.profile?.name ?? "Portfolio"}</h1>
      <NightField
        scoreboardName={data.siteSettings?.scoreboardName ?? "GOMEZ FC"}
        panels={panels}
      />
      <BackButton href="/" label="Back to the start screen" />
      <ProfileButton photo={data.profile?.photo} />
    </main>
  );
}
