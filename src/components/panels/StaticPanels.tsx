import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { formatBytes, formatRange } from "@/lib/format";

import { TrackButton } from "./TrackButton";
import type { SiteContent } from "./types";
import s from "./panels.module.css";

function External({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function Empty() {
  return <p className={s.muted}>Nothing here yet.</p>;
}

export function AboutPanel({ profile }: { profile: SiteContent["profile"] }) {
  if (!profile) return <Empty />;
  return (
    <div className={s.body}>
      <div className={s.profile}>
        {profile.photo && (
          <SanityImage image={profile.photo} width={56} aspect={1} className={s.avatar} />
        )}
        <div>
          <p className={s.name}>{profile.name}</p>
          {profile.headline && <p className={`${s.muted} ${s.small}`}>{profile.headline}</p>}
        </div>
      </div>
      <RichText value={profile.bio} />
      {(profile.email || profile.location) && (
        <div className={`${s.card} ${s.contact}`}>
          {profile.contactNote && <p className={s.muted}>{profile.contactNote}</p>}
          {profile.email && (
            <p>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
          )}
          {profile.location && <p className={s.muted}>{profile.location}</p>}
        </div>
      )}
    </div>
  );
}

export function LinksPanel({ links }: { links: SiteContent["links"] }) {
  if (!links) return <Empty />;
  const resume = links.resume;
  return (
    <div className={s.body}>
      {links.github && (
        <External href={links.github} className={s.linkCard}>
          GitHub
        </External>
      )}
      {links.linkedin && (
        <External href={links.linkedin} className={s.linkCard}>
          LinkedIn
        </External>
      )}
      {links.otherLinks?.map((l) => (
        <External key={l._key} href={l.url} className={s.linkCard}>
          {l.label}
        </External>
      ))}
      {resume?.url && (
        <a
          href={`${resume.url}?dl=${encodeURIComponent(resume.filename ?? "resume.pdf")}`}
          className={`${s.linkCard} ${s.resume}`}
          download
        >
          Download resume
          {resume.size ? <span className={s.muted}> · PDF, {formatBytes(resume.size)}</span> : null}
        </a>
      )}
    </div>
  );
}

export function ExperiencePanel({ experience }: { experience: SiteContent["experience"] }) {
  if (!experience.length) return <Empty />;
  return (
    <ol className={`${s.body} ${s.list}`}>
      {experience.map((e) => (
        <li key={e._id} className={s.card}>
          <div className={s.entryHead}>
            {e.logo && <SanityImage image={e.logo} width={32} aspect={1} className={s.logo} />}
            <div>
              <h3 className={s.h3}>
                {e.role} <span className={s.muted}>· {e.company}</span>
              </h3>
              <p className={`${s.muted} ${s.small}`}>
                {formatRange(e.startDate, e.endDate)}
                {e.location && ` · ${e.location}`}
              </p>
            </div>
          </div>
          <RichText value={e.summary} />
        </li>
      ))}
    </ol>
  );
}

export function EducationPanel({ education }: { education: SiteContent["education"] }) {
  if (!education.length) return <Empty />;
  return (
    <ol className={`${s.body} ${s.list}`}>
      {education.map((e) => (
        <li key={e._id} className={s.card}>
          <div className={s.entryHead}>
            {e.logo && <SanityImage image={e.logo} width={32} aspect={1} className={s.logo} />}
            <div>
              <h3 className={s.h3}>{e.school}</h3>
              <p className={s.small}>{[e.degree, e.field].filter(Boolean).join(", ")}</p>
              <p className={`${s.muted} ${s.small}`}>{formatRange(e.startDate, e.endDate, "")}</p>
            </div>
          </div>
          {e.honors && <p className={s.small}>{e.honors}</p>}
          {!!e.publications?.length && (
            <>
              <p className={s.subhead}>Publications</p>
              <ul className={`${s.list} ${s.small}`}>
                {e.publications.map((pub) => (
                  <li key={pub._key}>
                    {pub.url ? <External href={pub.url}>{pub.title}</External> : pub.title}
                    {pub.venue && <span className={s.muted}> · {pub.venue}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

export function SkillsPanel({ skillGroups }: { skillGroups: SiteContent["skillGroups"] }) {
  if (!skillGroups.length) return <Empty />;
  return (
    <div className={s.body}>
      {skillGroups.map((g) => (
        <div key={g._id} className={s.group}>
          <p className={s.subhead}>{g.label}</p>
          <ul className={s.chips}>
            {g.items?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function CreditsPanel({ credits }: { credits: SiteContent["credits"] }) {
  if (!credits) return <Empty />;
  return (
    <div className={`${s.body} ${s.credits}`}>
      {!!credits.tracks?.length && (
        <>
          <p className={s.subhead}>Soundtrack</p>
          <ul className={s.list}>
            {credits.tracks.map((t) => (
              <li key={t._key} className={s.track}>
                {t.audio?.url && <TrackButton src={t.audio.url} title={t.title} />}
                <span>
                  {t.url ? <External href={t.url}>{t.title}</External> : t.title}
                  {t.artist && <span className={s.muted}> · {t.artist}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {!!credits.thanks?.length && (
        <>
          <p className={s.subhead}>Thanks</p>
          <RichText value={credits.thanks} />
        </>
      )}
      {credits.builtWith && (
        <>
          <p className={s.subhead}>Built with</p>
          <p className={s.small}>{credits.builtWith}</p>
        </>
      )}
    </div>
  );
}
