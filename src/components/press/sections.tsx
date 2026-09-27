import type { ReactNode } from "react";

import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { formatBytes, formatRange } from "@/lib/format";
import type { PRESS_QUERY_RESULT } from "@/sanity/types";

import styles from "./press.module.css";

type Press = PRESS_QUERY_RESULT;

export const SECTIONS = [
  { id: "about", title: "About me" },
  { id: "projects", title: "Projects" },
  { id: "experience", title: "Experience" },
  { id: "education", title: "Education" },
  { id: "skills", title: "Skills and stack" },
  { id: "places", title: "Places I've lived" },
  { id: "links", title: "Links" },
  { id: "credits", title: "Credits" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const title = SECTIONS.find((s) => s.id === id)!.title;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={styles.section}>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function About({ profile }: { profile: Press["profile"] }) {
  if (!profile) return null;
  return (
    <Section id="about">
      <RichText value={profile.bio} />
      {(profile.email || profile.location) && (
        <div className={styles.contact}>
          {profile.contactNote && <p className={styles.muted}>{profile.contactNote}</p>}
          {profile.email && (
            <p>
              <a href={`mailto:${profile.email}`} className={styles.email}>
                {profile.email}
              </a>
            </p>
          )}
          {profile.location && <p className={styles.muted}>{profile.location}</p>}
        </div>
      )}
    </Section>
  );
}

export function Projects({ projects }: { projects: Press["projects"] }) {
  if (!projects.length) return null;
  return (
    <Section id="projects">
      <ul className={styles.stack}>
        {projects.map((p) => (
          <li key={p._id} id={`project-${p.slug}`} className={styles.card}>
            <details>
              <summary>
                <span className={styles.cardTitle}>
                  {p.title}
                  {p.featured && <span className={styles.badge}>Featured</span>}
                </span>
                {p.blurb && <span className={styles.cardBlurb}>{p.blurb}</span>}
              </summary>
              <div className={styles.detail}>
                {p.role && (
                  <p className={styles.muted}>
                    <strong>Role:</strong> {p.role}
                  </p>
                )}
                <RichText value={p.description} />
                {!!p.images?.length && (
                  <div className={styles.gallery}>
                    {p.images.map((img, i) => (
                      <SanityImage
                        key={img.asset?._ref ?? i}
                        image={img}
                        width={640}
                        aspect={16 / 10}
                        sizes="(max-width: 720px) 100vw, 640px"
                      />
                    ))}
                  </div>
                )}
                {!!p.links?.length && (
                  <ul className={styles.inlineList}>
                    {p.links.map((l) => (
                      <li key={l._key}>
                        <ExternalLink href={l.url}>{l.label}</ExternalLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
            {!!p.stack?.length && (
              <ul className={styles.chips} aria-label={`${p.title} stack`}>
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Experience({ experience }: { experience: Press["experience"] }) {
  if (!experience.length) return null;
  return (
    <Section id="experience">
      <ol className={styles.timeline}>
        {experience.map((e) => (
          <li key={e._id} className={styles.entry}>
            <div className={styles.entryHead}>
              {e.logo && (
                <SanityImage image={e.logo} width={40} aspect={1} className={styles.logo} />
              )}
              <div>
                <h3 className={styles.entryTitle}>
                  {e.role} <span className={styles.at}>at</span> {e.company}
                </h3>
                <p className={styles.muted}>
                  {formatRange(e.startDate, e.endDate)}
                  {e.location && ` · ${e.location}`}
                </p>
              </div>
            </div>
            <RichText value={e.summary} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Education({ education }: { education: Press["education"] }) {
  if (!education.length) return null;
  return (
    <Section id="education">
      <ol className={styles.timeline}>
        {education.map((e) => (
          <li key={e._id} className={styles.entry}>
            <h3 className={styles.entryTitle}>{e.school}</h3>
            <p>{[e.degree, e.field].filter(Boolean).join(", ")}</p>
            <p className={styles.muted}>{formatRange(e.startDate, e.endDate, "")}</p>
            {e.honors && <p className={styles.muted}>{e.honors}</p>}
            {!!e.publications?.length && (
              <>
                <h4 className={styles.subhead}>Publications</h4>
                <ul className={styles.plainList}>
                  {e.publications.map((pub) => (
                    <li key={pub._key}>
                      {pub.url ? <ExternalLink href={pub.url}>{pub.title}</ExternalLink> : pub.title}
                      {pub.venue && <span className={styles.muted}> · {pub.venue}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Skills({ skillGroups }: { skillGroups: Press["skillGroups"] }) {
  if (!skillGroups.length) return null;
  return (
    <Section id="skills">
      <dl className={styles.skills}>
        {skillGroups.map((g) => (
          <div key={g._id}>
            <dt>{g.label}</dt>
            <dd>
              <ul className={styles.chips}>
                {g.items?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function Places({ places }: { places: Press["places"] }) {
  if (!places.length) return null;
  return (
    <Section id="places">
      <ul className={styles.places}>
        {places.map((p) => (
          <li key={p._id} className={styles.place}>
            <SanityImage
              image={p.photo}
              width={400}
              aspect={4 / 3}
              sizes="(max-width: 720px) 100vw, 340px"
            />
            <h3 className={styles.entryTitle}>
              {p.city}
              {p.region && <span className={styles.muted}>, {p.region}</span>}
            </h3>
            {p.years && <p className={styles.muted}>{p.years}</p>}
            {p.note && <p>{p.note}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Links({ links }: { links: Press["links"] }) {
  if (!links) return null;
  const resume = links.resume?.url;
  const all = [
    links.github && { key: "github", label: "GitHub", url: links.github },
    links.linkedin && { key: "linkedin", label: "LinkedIn", url: links.linkedin },
    ...(links.otherLinks ?? []).map((l) => ({ key: l._key, label: l.label, url: l.url })),
  ].filter((l) => !!l);

  return (
    <Section id="links">
      {resume && (
        <p>
          <a
            href={`${resume}?dl=${encodeURIComponent(links.resume?.filename ?? "resume.pdf")}`}
            className={styles.resume}
            download
          >
            Download resume
            {links.resume?.size ? (
              <span className={styles.resumeMeta}> (PDF, {formatBytes(links.resume.size)})</span>
            ) : null}
          </a>
        </p>
      )}
      {!!all.length && (
        <ul className={styles.plainList}>
          {all.map((l) => (
            <li key={l.key}>
              <ExternalLink href={l.url}>{l.label}</ExternalLink>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function Credits({ credits }: { credits: Press["credits"] }) {
  if (!credits) return null;
  return (
    <Section id="credits">
      {!!credits.tracks?.length && (
        <>
          <h3 className={styles.subhead}>Soundtrack</h3>
          <ul className={styles.plainList}>
            {credits.tracks.map((t) => (
              <li key={t._key} className={styles.track}>
                <span>
                  {t.url ? <ExternalLink href={t.url}>{t.title}</ExternalLink> : t.title}
                  {t.artist && <span className={styles.muted}> · {t.artist}</span>}
                </span>
                {t.audio?.url && (
                  <audio controls preload="none" src={t.audio.url}>
                    <a href={t.audio.url}>Listen to {t.title}</a>
                  </audio>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {!!credits.thanks?.length && (
        <>
          <h3 className={styles.subhead}>Thanks</h3>
          <RichText value={credits.thanks} />
        </>
      )}
      {credits.builtWith && <p className={styles.muted}>Built with {credits.builtWith}</p>}
    </Section>
  );
}
