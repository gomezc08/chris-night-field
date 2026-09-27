# CLAUDE.md

Gomez Field: a portfolio as a 2D night soccer field. Full spec in `SPEC.md`; `reference/prototype.html` is the behavior source of truth for the scene.

## Rules

- Build one stage at a time. Stop at the end of each stage for review.
- Never hard-code personal content. Text comes from Sanity or is a placeholder seeded in Sanity.
- No paid services, databases, auth providers, or analytics. Vercel Hobby + Sanity Free only.
- Keep scene code separate from content code. The scene receives section data as props.
- When the prototype and the spec disagree, follow the spec and flag the conflict in the stage summary.
- Git: one branch + PR per stage (`stage-N-name`). Never commit to `main`, never force-push. Push only after Chris approves.
