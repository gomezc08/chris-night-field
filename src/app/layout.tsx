import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { SoundProvider } from "@/components/sound/SoundProvider";
import { siteUrl } from "@/lib/siteUrl";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Chris's own ambient track, if he uploaded one; it replaces the built-in loop.
  const settings = await sanityFetch({ query: SITE_SETTINGS_QUERY, tags: ["siteSettings"] });
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <SoundProvider ambientTrackUrl={settings?.ambientTrack?.url}>{children}</SoundProvider>
      </body>
    </html>
  );
}
