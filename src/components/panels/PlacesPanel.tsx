"use client";

import { useState } from "react";

import { SanityImage } from "@/components/SanityImage";

import type { SiteContent } from "./types";
import s from "./panels.module.css";

type Place = SiteContent["places"][number];
type Photo = NonNullable<NonNullable<Place["photos"]>[number]>;

/** One place at a time, with previous/next and a "1 / N" indicator. */
export function PlacesPanel({ places }: { places: SiteContent["places"] }) {
  const [index, setIndex] = useState(0);
  if (!places.length) return <p className={s.muted}>Nothing here yet.</p>;

  const place = places[Math.min(index, places.length - 1)];
  const photos = (place.photos ?? []).filter((p): p is Photo => !!p?.asset);
  return (
    <div className={s.body}>
      <div className={s.placeCard} aria-live="polite">
        {/* Keyed so each place starts on its cover photo. */}
        <PhotoGallery key={place._id} photos={photos} city={place.city} />
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

/** Big photo plus thumbnails. Click a thumbnail to jump, or the big photo for the next one. */
function PhotoGallery({ photos, city }: { photos: Photo[]; city: string }) {
  const [current, setCurrent] = useState(0);
  if (!photos.length) return null;

  const photo = photos[Math.min(current, photos.length - 1)];
  const many = photos.length > 1;

  return (
    <div>
      <button
        type="button"
        className={s.photoMain}
        onClick={() => many && setCurrent((c) => (c + 1) % photos.length)}
        disabled={!many}
        aria-label={many ? `${city}: next photo` : undefined}
      >
        <SanityImage
          image={photo}
          width={700}
          aspect={16 / 10}
          sizes="(max-width: 760px) 100vw, 700px"
          className={s.placePhoto}
        />
        {many && (
          <span className={s.photoCount} aria-live="polite">
            {current + 1} / {photos.length}
          </span>
        )}
      </button>
      {many && (
        <ul className={s.thumbs} aria-label={`${city} photos`}>
          {photos.map((p, i) => (
            <li key={`${p.asset?._ref}-${i}`}>
              <button
                type="button"
                className={s.thumb}
                onClick={() => setCurrent(i)}
                aria-pressed={i === current}
                aria-label={p.alt ? `Show photo: ${p.alt}` : `Show photo ${i + 1}`}
              >
                <SanityImage image={p} width={88} aspect={4 / 3} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
