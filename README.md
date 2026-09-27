# Gomez Field

A personal portfolio as a 2D night soccer field.

![Gomez Field](reference/screenshots/hero.png)

## Overview

The site is a night soccer field under floodlights. It loads pitch black, the floodlight towers click on one at a time, and a lone player juggles at the center circle. Eight objects around the field are the navigation. Clicking one sends the player over to do something, then opens a frosted panel with that section:

| Spot | Section |
|---|---|
| Bag on the bench | About me |
| Home goal | Projects |
| Away goal | Links (and resume) |
| Scoreboard | Experience |
| Tactics board | Education |
| Corner flag | Places I've lived |
| Ball bag | Skills and stack |
| Bleachers | Credits |

[`/press`](http://localhost:3000/press) is the "press box": every section on one fast, plain page for recruiters, SEO, and mobile.

> **Status:** Stage 3 (player). A stick-figure player juggles at center, takes water breaks, and runs a routine at each spot before its panel opens. Sound, mobile, accessibility, and the illustrated art pass come in Stage 4.

## Stack

- **Next.js** (App Router, TypeScript), statically generated with tag-based revalidation.
- **Sanity** (Free plan) for content, with Studio embedded at `/studio`.
- **Vercel** (Hobby) for hosting.
- **Canvas 2D** for the scene (Stage 2).
- **Howler.js** for sound, muted by default (Stage 4).
- **Player animation:** a procedural stick figure (Stage 3), swappable for a Rive state machine behind one interface (Stage 4).

## Running locally

**Prerequisites:** Node 20.9+ (developed on Node 24) and npm.

```bash
npm install
cp .env.example .env   # then fill in the values, see below
npm run dev
```

Open [localhost:3000/press](http://localhost:3000/press) for the press box and [localhost:3000/studio](http://localhost:3000/studio) for Studio.

**Environment variables** (see [`.env.example`](.env.example)):

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID, from sanity.io/manage. |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name, `production`. |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the publish webhook. Generate with `openssl rand -hex 24`. |

**First-time Sanity setup:**

1. Log in to the Sanity CLI: `npx sanity login`.
2. In sanity.io/manage → your project → **API → CORS origins**, add `http://localhost:3000` with **Allow credentials** checked.
3. Seed placeholder content so every section renders: `npm run seed`. It's safe to re-run; existing documents are left alone.

**Scripts:**

| Command | What it does |
|---|---|
| `npm run dev` | Dev server. Caching is off in dev, so every reload refetches. |
| `npm run build && npm start` | Production build, which is where caching and revalidation apply. |
| `npm run lint` | ESLint. |
| `npm test` | Vitest: player routine and state-consistency tests. |
| `npm run typegen` | Re-extract the schema and regenerate `src/sanity/types.ts`. Run after changing a schema or a GROQ query. |
| `npm run seed` | Create placeholder documents in Sanity. |

## Editing content

Go to `/studio` on the live site (or locally) and log in with your Sanity account.

| In Studio | Controls |
|---|---|
| **About me** | Name, headline, photo, bio, email, city, and contact note. |
| **Projects** | Project cards: title, blurb, description, images, role, stack, links, featured. Drag to reorder. |
| **Experience** | Jobs. Sorted newest first by start date; drag order only breaks ties. Leave the end date empty for a current role. |
| **Education** | Schools, degrees, honors, and publications. Drag to reorder. |
| **Skills and stack** | Skill groups (e.g. Languages, Infra) and their chips. Drag to reorder. |
| **Places I've lived** | City cards with photo, years, and a short note. Drag to reorder. |
| **Links** | GitHub, LinkedIn, other links, and the resume PDF. Uploading a new PDF changes what "Download resume" serves. |
| **Credits** | Soundtrack entries (optionally with audio), thanks, and "built with". |
| **Site settings** | Scoreboard name, SEO title and description, share image, and ambient track. |

Hit **Publish** and the live site updates within a few seconds. No redeploy needed.

## Deploying

1. **Vercel:** import the GitHub repo at vercel.com/new (Hobby plan; framework is detected as Next.js).
2. **Env vars:** in the Vercel project → **Settings → Environment Variables**, add the three variables above for Production and Preview.
3. **CORS:** in sanity.io/manage → **API → CORS origins**, add the Vercel URL (e.g. `https://your-site.vercel.app`) with **Allow credentials** checked, so Studio works there.
4. **Webhook:** in sanity.io/manage → **API → Webhooks**, create one:
   - **URL:** `https://your-site.vercel.app/api/revalidate`
   - **Dataset:** `production`
   - **Trigger on:** Create, Update, Delete
   - **Filter:** `_type in ["profile", "project", "experience", "education", "skillGroup", "place", "links", "credits", "siteSettings"]`
   - **Projection:** `{_type}`
   - **HTTP method:** POST
   - **Secret:** the same value as `SANITY_REVALIDATE_SECRET`

   Each publish expires the cache tag for that document type, so the next visit gets fresh content. If a webhook is ever missed, pages still refresh on their own every 60 seconds.

## Project structure

```
src/
  app/
    page.tsx                  /  the night field (fetches content, maps spots to panels)
    press/page.tsx            /press, the press box
    studio/[[...tool]]/       /studio, embedded Sanity Studio
    api/revalidate/route.ts   Sanity webhook → revalidateTag
  scene/                      Canvas engine: 900×560 design space, drawing, intro, hit-testing.
                              Knows nothing about Sanity or React.
    director.ts               Player routines (step queue, open/close per spot, idle water break)
    player/                   PlayerRenderer interface + the procedural stick figure
  components/
    field/                    React host for the scene: canvas, tooltip, controls, panel shell
    panels/                   The eight panel layouts (content from Sanity)
    press/                    Press box sections and styles
    SanityImage.tsx           next/image backed by Sanity's CDN
    RichText.tsx              Portable Text renderer
  sanity/
    schemaTypes/              Content model (one file per type)
    structure.ts              Studio sidebar: singletons and orderable lists
    queries.ts                Typed GROQ queries, one per section plus PRESS_QUERY
    types.ts                  Generated by `npm run typegen` (don't edit)
    lib/                      Client, cached fetch, image URL builder and loader
  lib/                        Small shared helpers
scripts/seed.ts               Placeholder content
sanity.config.ts              Studio config
sanity.cli.ts                 Sanity CLI and TypeGen config
reference/                    Prototype and screenshots (source of truth for the scene)
SPEC.md                       Build spec
```

## Free-tier notes

- **Sanity datasets on the Free plan are public.** Anything in Sanity can be read by anyone with the project ID. Never store private data there: no phone number, home address, or anything sensitive.
- **Sanity Free** limits: 20 users, 2 datasets, 10,000 documents, 2 GROQ-powered webhooks, plus monthly API request, bandwidth, and asset storage caps. At the limit it stops serving rather than billing. Compress photos before uploading.
- **Vercel Hobby** is free for personal, non-commercial use, with monthly bandwidth and function limits. Images are resized by Sanity's CDN, not Vercel's image optimizer, so they don't count against Vercel's image quota.
- Pages are static and cached, so visitor traffic barely touches Sanity's API. Sanity is only queried at build time and when a publish (or the 60-second fallback) revalidates a page.
