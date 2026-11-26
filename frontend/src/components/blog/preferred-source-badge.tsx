import Image from "next/image";

const PREFERRED_SOURCE_URL = "https://www.google.com/preferences/source?q=ordinaly.ai";

/** Google "preferred source" badge. A plain link: nothing from Google loads until the visitor clicks. */
export default function PreferredSourceBadge({ width = 169 }: { width?: number }) {
  const height = Math.round(width * 0.314);
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Añadir Ordinaly como fuente preferida en Google"
      className="inline-block"
    >
      <Image
        src="/assets/preferred-source/badge-light-es.png"
        alt=""
        width={width}
        height={height}
        className="dark:hidden"
      />
      <Image
        src="/assets/preferred-source/badge-dark-es.png"
        alt=""
        width={width}
        height={height}
        className="hidden dark:block"
      />
    </a>
  );
}
