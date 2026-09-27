import Link from "next/link";

import { PersonIcon } from "@/components/field/icons";
import { SanityImage, type SanityImageData } from "@/components/SanityImage";

import styles from "./nav.module.css";

/** Round back button, fixed in the top-left corner. */
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`${styles.round} ${styles.topLeft}`}
      aria-label={label}
      title={label}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}

/** Round profile button to the press box: his photo if there is one, otherwise a person icon. */
export function ProfileButton({ photo }: { photo?: SanityImageData }) {
  const label = "Press box: everything on one page";
  return (
    <Link
      href="/press"
      className={`${styles.round} ${styles.profile} ${styles.topRight}`}
      aria-label={label}
      title={label}
    >
      {photo?.asset ? (
        <SanityImage image={{ ...photo, alt: "" }} width={52} aspect={1} preload />
      ) : (
        <PersonIcon />
      )}
    </Link>
  );
}
