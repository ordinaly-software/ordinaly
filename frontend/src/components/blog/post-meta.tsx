"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { urlFor } from "@/lib/image";
import type { BlogPost } from "./types";

export const formatPostDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Europe/Madrid",
      })
    : "";

/** Avatar + author name · date · reading time. Renders only what the post has. */
export function PostByline({
  post,
  className = "",
}: {
  post: Pick<BlogPost, "author" | "publishedAt" | "readingMinutes">;
  className?: string;
}) {
  const t = useTranslations("blog");
  const { author } = post;
  const avatar = author?.image?.asset ? urlFor(author.image).width(72).height(72).url() : "";
  const date = formatPostDate(post.publishedAt);
  const minutes = post.readingMinutes != null ? Math.max(1, post.readingMinutes) : null;
  const details = [date, minutes ? t("readingTime", { minutes }) : ""].filter(Boolean);

  if (!author?.name && details.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      {author?.name && avatar && (
        <Image
          src={avatar}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover ring-1 ring-black/10"
        />
      )}
      <div className="min-w-0 leading-snug">
        {author?.name && (
          <p className="truncate font-medium text-slate-dark dark:text-ivory-light">{author.name}</p>
        )}
        {details.length > 0 && (
          <p className="text-slate-light dark:text-cloud-medium">{details.join(" · ")}</p>
        )}
      </div>
    </div>
  );
}
