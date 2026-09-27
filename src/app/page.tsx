import type { Metadata } from "next";
import Link from "next/link";

import { siteMetadata } from "@/lib/metadata";
import { NightField } from "@/components/field/NightField";
import { StartScreen } from "@/components/start/StartScreen";
import { PlacesPanel } from "@/components/panels/PlacesPanel";
import { ProjectsPanel } from "@/components/panels/ProjectsPanel";
import {
  AboutPanel,
  CreditsPanel,
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
  return siteMetadata(await getContent(), "/");
}

export default async function Home() {
  const data = await getContent();

  // Which content each spot on the field opens.
  const panels: Record<SpotKey, React.ReactNode> = {
    bag: <AboutPanel profile={data.profile} />,
    goalR: <ProjectsPanel projects={data.projects} />,
    goalL: <LinksPanel links={data.links} />,
    score: <ExperiencePanel experience={data.experience} />,
    board: <EducationPanel education={data.education} />,
    flag: <PlacesPanel places={data.places} />,
    ballbag: <SkillsPanel skillGroups={data.skillGroups} />,
    stands: <CreditsPanel credits={data.credits} />,
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.srOnly}>{data.profile?.name ?? "Portfolio"}</h1>
      <StartScreen>
        <NightField
          scoreboardName={data.siteSettings?.scoreboardName ?? "GOMEZ FC"}
          ambientTrackUrl={data.siteSettings?.ambientTrack?.url}
          panels={panels}
        />
      </StartScreen>
      <Link href="/press" className={styles.pressLink}>
        Press box: everything on one page →
      </Link>
    </main>
  );
}
