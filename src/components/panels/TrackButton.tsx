"use client";

import { useEffect, useRef, useState } from "react";

import s from "./panels.module.css";

/** Small play/pause toggle for a soundtrack entry. Only one track plays at a time. */
export function TrackButton({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current!;
    // Pause when another track starts.
    const onOtherPlay = (e: Event) => {
      if (e.target !== audio) audio.pause();
    };
    document.addEventListener("play", onOtherPlay, true);
    return () => {
      document.removeEventListener("play", onOtherPlay, true);
      audio.pause();
    };
  }, []);

  function toggle() {
    const audio = audioRef.current!;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  return (
    <>
      <button
        type="button"
        className={s.play}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </>
  );
}
