import type { Metadata } from "next";
import Link from "next/link";

import { siteMetadata } from "@/lib/metadata";
import { NightField } from "@/components/field/NightField";
import { PersonIcon } from "@/components/field/icons";
import { SanityImage } from "@/components/SanityImage";
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
    bag: <CreditsPanel credits={data.credits} />,
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
      <h1 className={styles.srOnly}>{data.profile?.name ?? "Portfolio"}</h1>
      <StartScreen>
        <NightField
          scoreboardName={data.siteSettings?.scoreboardName ?? "GOMEZ FC"}
          ambientTrackUrl={data.siteSettings?.ambientTrack?.url}
          panels={panels}
        />
      </StartScreen>
      {/* Profile button to the press box: his photo if there is one, otherwise a person icon. */}
      <Link
        href="/press"
        className={styles.pressLink}
        aria-label="Press box: everything on one page"
        title="Press box: everything on one page"
      >
        {data.profile?.photo?.asset ? (
          <SanityImage image={{ ...data.profile.photo, alt: "" }} width={48} aspect={1} preload />
        ) : (
          <PersonIcon />
        )}
      </Link>
    </main>
  );
}
