
import React from 'react';
import Link from 'next/link';
import { urlFor } from '@/lib/image';
import type { PortableTextComponentProps } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { ReactNode } from 'react';
import Image from 'next/image';
import YoutubeEmbed from './youtube-embed';

type ImageType = {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
  caption?: string;
  attribution?: string;
};
type VideoType = { url?: string; caption?: string; poster?: { asset?: { _ref?: string } } };
type YoutubeType = { url?: string; title?: string; caption?: string };
type CodeType = { code?: string; filename?: string };

// Sanity asset refs look like image-<id>-<width>x<height>-<ext>
export const dimensionsFromRef = (ref?: string) => {
  const match = ref?.match(/-(\d+)x(\d+)-[a-z]+$/i);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : { width: 1200, height: 800 };
};

const Caption = ({ caption, attribution }: { caption?: string; attribution?: string }) =>
  caption || attribution ? (
    <figcaption className="mt-3 text-center text-sm leading-snug tracking-[0.005em] text-slate-medium dark:text-cloud-medium">
      {caption}
      {caption && attribution ? ' · ' : null}
      {attribution ? <span className="opacity-75">{attribution}</span> : null}
    </figcaption>
  ) : null;

const headingIdFor = (
  props: PortableTextComponentProps<PortableTextBlock>,
  headingIdByKey: Record<string, string>
) => {
  const key = props?.value?._key;
  return key ? headingIdByKey[key] : undefined;
};

export const createPortableTextComponents = (headingIdByKey: Record<string, string> = {}) => ({
  types: {
    image: ({ value }: { value: ImageType }) => {
      const ref = value?.asset?._ref;
      if (!ref) return null;
      const { width, height } = dimensionsFromRef(ref);
      return (
        <figure className="mx-auto my-8 max-w-2xl">
          <Image
            src={urlFor(ref).width(1600).url()}
            alt={value.alt || value.caption || ''}
            width={width}
            height={height}
            sizes="(min-width: 768px) 768px, 100vw"
            loading="lazy"
            className="h-auto w-full rounded-2xl shadow-md ring-1 ring-black/5"
          />
          <Caption caption={value.caption} attribution={value.attribution} />
        </figure>
      );
    },
    youtube: ({ value }: { value: YoutubeType }) => (
      <YoutubeEmbed url={value?.url} title={value?.title} caption={value?.caption} />
    ),
    video: ({ value }: { value: VideoType }) =>
      value?.url ? (
        <figure className="mx-auto my-8 max-w-3xl">
          <video
            controls
            playsInline
            preload="metadata"
            poster={value.poster?.asset?._ref ? urlFor(value.poster.asset._ref).width(1600).url() : undefined}
            className="w-full rounded-2xl bg-black shadow-md ring-1 ring-black/5"
          >
            <source src={value.url} />
          </video>
          <Caption caption={value.caption} />
        </figure>
      ) : null,
    codeBlock: ({ value }: { value: CodeType }) =>
      value?.code ? (
        <figure className="my-8 overflow-hidden rounded-2xl bg-slate-dark text-ivory-light shadow-md ring-1 ring-black/5">
          {value.filename && (
            <figcaption className="border-b border-white/10 px-4 py-2 text-xs font-medium tracking-wide text-cloud-medium">
              {value.filename}
            </figcaption>
          )}
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>{value.code}</code>
          </pre>
        </figure>
      ) : null,
  },
  block: {
    h1: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h1 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-tight mt-8 mb-4 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h1>
    ),
    h2: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h2 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-tight mt-8 mb-4 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h2>
    ),
    h3: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h3 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-2xl md:text-3xl font-semibold tracking-[-0.02em] leading-tight mt-6 mb-3 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h3>
    ),
    h4: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h4 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-xl md:text-2xl font-semibold tracking-[-0.02em] leading-tight mt-4 mb-2 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h4>
    ),
    h5: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h5 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-lg font-semibold mt-2 mb-2 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h5>
    ),
    h6: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h6 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-base font-semibold mt-2 mb-2 text-slate-dark dark:text-ivory-light">
        {props.children}
      </h6>
    ),
    blockquote: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <blockquote className="border-l-4 border-cobalt dark:border-cobalt-light pl-4 italic text-slate-medium dark:text-cloud-medium my-6">{props.children}</blockquote>
    ),
    normal: (props: PortableTextComponentProps<PortableTextBlock>) => <p className="mb-5 text-base leading-[1.75] text-slate-dark dark:text-ivory-light">{props.children}</p>,
  },
  list: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-5 ml-6 list-disc text-base leading-[1.75] text-slate-dark dark:text-ivory-light">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-5 ml-6 list-decimal text-base leading-[1.75] text-slate-dark dark:text-ivory-light">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: ReactNode }) => (
      <li className="mb-2 pl-1 marker:text-cobalt dark:marker:text-cobalt-light">
        {children}
      </li>
    ),
    number: ({ children }: { children?: ReactNode }) => (
      <li className="mb-2 pl-1 marker:font-semibold marker:text-cobalt dark:marker:text-cobalt-light">
        {children}
      </li>
    ),
  },
  marks: {
    link: ({ children, value }: { children: ReactNode; value?: { href?: string; blank?: boolean } }) => {
      const href = value?.href || '#';
      const isExternal = /^https?:\/\//i.test(href);
      const className = "underline underline-offset-2 text-cobalt dark:text-cobalt-light hover:text-cobalt-light dark:hover:text-cobalt-light";
      return isExternal || value?.blank || /^(mailto|tel):/i.test(href) ? (
        <a
          href={href}
          className={className}
          {...(isExternal || value?.blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>{children}</Link>
      );
    },
    underline: ({ children }: { children?: ReactNode }) => <span className="underline underline-offset-2">{children}</span>,
    'strike-through': ({ children }: { children?: ReactNode }) => <s>{children}</s>,
    code: ({ children }: { children?: ReactNode }) => (
      <code className="rounded-md bg-slate-dark/10 px-1.5 py-0.5 text-[0.9em] dark:bg-white/10">{children}</code>
    ),
  },
});

export const portableTextComponents = createPortableTextComponents();
