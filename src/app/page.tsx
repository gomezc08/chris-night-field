import type { Metadata } from "next";

import { StartScreen } from "@/components/start/StartScreen";
import { siteMetadata } from "@/lib/metadata";
import { sanityFetch } from "@/sanity/lib/fetch";
import { START_QUERY } from "@/sanity/queries";

async function getStart() {
  return sanityFetch({ query: START_QUERY, tags: ["profile", "siteSettings"] });
}

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(await getStart(), "/");
}

export default async function StartPage() {
  const { profile } = await getStart();
  return (
    <main>
      <h1 className="sr-only">{profile?.name ?? "Portfolio"}</h1>
      <StartScreen />
    </main>
  );
}
