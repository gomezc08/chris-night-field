"use client";

import { useState } from "react";

import { SanityImage } from "@/components/SanityImage";

import type { SiteContent } from "./types";
import s from "./panels.module.css";

/** One place at a time, with previous/next and a "1 / N" indicator. */
export function PlacesPanel({ places }: { places: SiteContent["places"] }) {
  const [index, setIndex] = useState(0);
  if (!places.length) return <p className={s.muted}>Nothing here yet.</p>;

  const place = places[Math.min(index, places.length - 1)];
  return (
    <div className={s.body}>
      <div className={s.placeCard} aria-live="polite">
        <SanityImage
          key={place._id}
          image={place.photo}
          width={700}
          aspect={16 / 10}
          sizes="(max-width: 760px) 100vw, 700px"
          className={s.placePhoto}
        />
        <h3 className={s.h3}>
          {place.city}
          {place.region && <span className={s.muted}>, {place.region}</span>}
        </h3>
        {place.years && <p className={`${s.muted} ${s.small}`}>{place.years}</p>}
        {place.note && <p>{place.note}</p>}
      </div>
      {places.length > 1 && (
        <div className={s.pager}>
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0}
            aria-label="Previous place"
          >
            ‹
          </button>
          <span>
            {index + 1} / {places.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            disabled={index === places.length - 1}
            aria-label="Next place"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
