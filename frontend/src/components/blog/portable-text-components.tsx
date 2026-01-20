
import React from 'react';
import Link from 'next/link';
import { urlFor } from '@/lib/image';
import type { PortableTextComponentProps } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import type { ReactNode } from 'react';
import Image from 'next/image';

type ImageType = { asset?: { _ref?: string; _id?: string; url?: string }; alt?: string };
type VideoType = { url?: string };

const headingIdFor = (
  props: PortableTextComponentProps<PortableTextBlock>,
  headingIdByKey: Record<string, string>
) => {
  const key = props?.value?._key;
  return key ? headingIdByKey[key] : undefined;
};

export const createPortableTextComponents = (headingIdByKey: Record<string, string> = {}) => ({
  types: {
    image: ({ value }: { value: ImageType }) => (
      value?.asset && value.asset._ref ? (
        <div className="my-6 flex justify-center">
          <Image
            src={urlFor(value.asset._ref).width(1200).url()}
            alt={value.alt || 'Blog image'}
            width={1200}
            height={800}
            loading="lazy"
            className="w-full h-auto max-w-lg md:max-w-lg rounded-sm shadow-sm"
          />
        </div>
      ) : null
    ),
    video: ({ value }: { value: VideoType }) => (
      value?.url ? (
        <div className="my-6 rounded-lg overflow-hidden">
          <video controls className="w-full h-auto">
            <source src={value.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null
    ),
  },
  block: {
    h1: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h1 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-4xl md:text-5xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
        {props.children}
      </h1>
    ),
    h2: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h2 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-3xl md:text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
        {props.children}
      </h2>
    ),
    h3: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h3 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-2xl md:text-3xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
        {props.children}
      </h3>
    ),
    h4: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h4 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-xl md:text-2xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
        {props.children}
      </h4>
    ),
    h5: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h5 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-lg font-semibold mt-2 mb-2 text-gray-900 dark:text-white">
        {props.children}
      </h5>
    ),
    h6: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <h6 id={headingIdFor(props, headingIdByKey)} className="scroll-mt-24 text-base font-semibold mt-2 mb-2 text-gray-900 dark:text-white">
        {props.children}
      </h6>
    ),
    blockquote: (props: PortableTextComponentProps<PortableTextBlock>) => (
      <blockquote className="border-l-4 border-[#1F8A0D] dark:border-[#3FBD6F] pl-4 italic text-gray-700 dark:text-gray-300 my-6">{props.children}</blockquote>
    ),
    normal: (props: PortableTextComponentProps<PortableTextBlock>) => <p className="mb-4 text-base text-gray-800 dark:text-gray-200">{props.children}</p>,
  },
  marks: {
    link: ({ children, value }: { children: ReactNode; value?: { href?: string } }) => (
      <Link href={value?.href || '#'} className="underline text-[#1F8A0D] dark:text-[#3FBD6F] hover:text-[#2EA55E] dark:hover:text-[#2EA55E]">{children}</Link>
    ),
  },
});

export const portableTextComponents = createPortableTextComponents();
