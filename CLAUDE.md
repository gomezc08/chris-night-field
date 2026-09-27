# CLAUDE.md

Gomez Field: a portfolio as a 2D night soccer field. Full spec in `SPEC.md`; `reference/prototype.html` is the behavior source of truth for the scene.

## Rules

- Build one stage at a time. Stop at the end of each stage for review.
- Never hard-code personal content. Text comes from Sanity or is a placeholder seeded in Sanity.
- No paid services, databases, auth providers, or analytics. Vercel Hobby + Sanity Free only.
- Keep scene code separate from content code. The scene receives section data as props.
- When the prototype and the spec disagree, follow the spec and flag the conflict in the stage summary.
- Git: one branch + PR per stage (`stage-N-name`). Never commit to `main`, never force-push. Push only after Chris approves.

@AGENTS.md

## Commands

- `npm run dev` — dev server (`/press`, `/studio`). No caching in dev; use `npm run build && npm start` to test revalidation.
- `npm run typegen` — after any schema or GROQ change. Commit the regenerated `src/sanity/types.ts`.
- `npm run seed` — placeholder content (needs `npx sanity login`).
- `npm run lint`, `npx tsc --noEmit` — before committing.

## Conventions

- GROQ lives in `src/sanity/queries.ts` via `defineQuery`; fetch with `sanityFetch` and tag by document `_type`.
- Singleton queries filter on both `_type` and `_id` so TypeGen infers a single type.
- List ordering uses `orderRank` (@sanity/orderable-document-list). Experience sorts by `startDate desc`, `orderRank` for ties.
- Images: `<SanityImage>` (Sanity CDN loader), never Vercel's optimizer.
- `@sanity/icons` v5: import from subpaths, e.g. `@sanity/icons/User`.
- Next 16: `revalidateTag` needs a second arg; we use `{ expire: 0 }` for immediate freshness.
