import type { Metadata } from "next";
import { Amatic_SC } from "next/font/google";

import { BackButton, ProfileButton } from "@/components/nav/NavButtons";
import { RichText } from "@/components/RichText";
import { siteMetadata } from "@/lib/metadata";
import { sanityFetch } from "@/sanity/lib/fetch";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";

import styles from "./about.module.css";

const amatic = Amatic_SC({ weight: ["700"], subsets: ["latin"] });

async function getAbout() {
  return sanityFetch({ query: ABOUT_PAGE_QUERY, tags: ["siteAbout", "profile", "siteSettings"] });
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAbout();
  const meta = siteMetadata(data, "/about");
  const heading = data.about?.heading ?? "About";
  return { ...meta, title: meta.title ? `${heading} · ${meta.title}` : heading };
}

export default async function AboutPage() {
  const { about, profile } = await getAbout();
  return (
    <main className={styles.page}>
      <BackButton href="/" label="Back to the start screen" />
      <ProfileButton photo={profile?.photo} />
      <article className={styles.article}>
        <h1 className={`${styles.heading} ${amatic.className}`}>{about?.heading ?? "About"}</h1>
        {about?.body?.length ? (
          <div className={styles.body}>
            <RichText value={about.body} />
          </div>
        ) : (
          <p className={styles.empty}>
            Nothing here yet. Write it in Studio under About (start screen).
          </p>
        )}
      </article>
    </main>
  );
}
