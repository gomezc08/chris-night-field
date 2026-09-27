import type { Metadata } from "next";
import Link from "next/link";

import {
  About,
  Accomplishments,
  Education,
  Experience,
  Links,
  Places,
  Projects,
  SECTIONS,
  Skills,
} from "@/components/press/sections";
import styles from "@/components/press/press.module.css";
import { BackButton } from "@/components/nav/NavButtons";
import { SanityImage } from "@/components/SanityImage";
import { siteMetadata } from "@/lib/metadata";
import { sanityFetch } from "@/sanity/lib/fetch";
import { CONTENT_TAGS, PRESS_QUERY } from "@/sanity/queries";

async function getPress() {
  return sanityFetch({ query: PRESS_QUERY, tags: CONTENT_TAGS });
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = siteMetadata(await getPress(), "/press");
  return { ...meta, title: meta.title ? `Press box · ${meta.title}` : "Press box" };
}

export default async function PressPage() {
  const data = await getPress();
  const { profile } = data;

  // Only list sections that will actually render.
  const hasContent: Record<(typeof SECTIONS)[number]["id"], boolean> = {
    about: !!profile,
    projects: data.projects.length > 0,
    experience: data.experience.length > 0,
    education: data.education.length > 0,
    skills: data.skillGroups.length > 0,
    places: data.places.length > 0,
    links: !!data.links,
    accomplishments: data.accomplishments.length > 0,
  };

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <div className={styles.back}>
        <BackButton href="/field" label="Back to the field" inline />
      </div>
      <header className={styles.header}>
        {profile?.photo && (
          <SanityImage
            image={profile.photo}
            width={112}
            aspect={1}
            preload
            className={styles.avatar}
          />
        )}
        <div>
          <h1 className={styles.name}>{profile?.name}</h1>
          {profile?.headline && <p className={styles.headline}>{profile.headline}</p>}
        </div>
      </header>

      <nav aria-label="Sections" className={styles.toc}>
        <ul>
          {SECTIONS.filter((s) => hasContent[s.id]).map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <main id="main">
        <About profile={profile} />
        <Projects projects={data.projects} />
        <Experience experience={data.experience} />
        <Education education={data.education} />
        <Skills skillGroups={data.skillGroups} />
        <Places places={data.places} />
        <Links links={data.links} />
        <Accomplishments accomplishments={data.accomplishments} />
      </main>

      <footer className={styles.footer}>
        <Link href="/field">Back to the field</Link>
      </footer>
    </div>
  );
}
