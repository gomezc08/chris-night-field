"use client";

import { useState } from "react";

import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";

import type { SiteContent } from "./types";
import s from "./panels.module.css";

/** Stack of project cards. Clicking a card expands its detail in place; one at a time. */
export function ProjectsPanel({ projects }: { projects: SiteContent["projects"] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!projects.length) return <p className={s.muted}>Nothing here yet.</p>;

  return (
    <ul className={`${s.body} ${s.list}`}>
      {projects.map((p) => {
        const open = openId === p._id;
        const detailId = `project-detail-${p._id}`;
        return (
          <li key={p._id} className={s.card}>
            <button
              type="button"
              className={s.projectToggle}
              aria-expanded={open}
              aria-controls={detailId}
              onClick={() => setOpenId(open ? null : p._id)}
            >
              <span className={s.h3}>
                {p.title}
                {p.featured && <span className={s.badge}>Featured</span>}
              </span>
              {p.blurb && <span className={`${s.muted} ${s.small}`}>{p.blurb}</span>}
            </button>
            {open && (
              <div id={detailId} className={s.detail}>
                {p.role && (
                  <p className={s.small}>
                    <span className={s.muted}>Role:</span> {p.role}
                  </p>
                )}
                <RichText value={p.description} />
                {!!p.images?.length && (
                  <div className={s.gallery}>
                    {p.images.map((img, i) => (
                      <SanityImage
                        key={img.asset?._ref ?? i}
                        image={img}
                        width={300}
                        aspect={16 / 10}
                        sizes="300px"
                      />
                    ))}
                  </div>
                )}
                {!!p.stack?.length && (
                  <ul className={s.chips} aria-label="Stack">
                    {p.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {!!p.links?.length && (
                  <ul className={s.inlineLinks}>
                    {p.links.map((l) => (
                      <li key={l._key}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
