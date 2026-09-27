import Link from "next/link";
import styles from "./page.module.css";

// Placeholder until the night field scene lands in Stage 2.
export default function Home() {
  return (
    <main className={styles.main}>
      <Link href="/press" className={styles.link}>
        Go to the press box
      </Link>
    </main>
  );
}
