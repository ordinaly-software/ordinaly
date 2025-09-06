import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/lib/image';

export const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      value?.asset ? (
        <div className="my-6 rounded-lg overflow-hidden">
          <Image
            src={urlFor(value).width(800).height(600).url()}
            alt={value.alt || 'Blog image'}
            width={600}
            height={350}
            className="w-full h-auto"
          />
        </div>
      ) : null
    ),
    video: ({ value }: any) => (
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
    h1: ({ children }: any) => <h1 className="text-4xl md:text-5xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-2xl md:text-3xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-xl md:text-2xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">{children}</h4>,
    h5: ({ children }: any) => <h5 className="text-lg font-semibold mt-2 mb-2 text-gray-900 dark:text-white">{children}</h5>,
    h6: ({ children }: any) => <h6 className="text-base font-semibold mt-2 mb-2 text-gray-900 dark:text-white">{children}</h6>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[#22C55E] pl-4 italic text-gray-700 dark:text-gray-300 my-6">{children}</blockquote>
    ),
    normal: ({ children }: any) => <p className="mb-4 text-base text-gray-800 dark:text-gray-200">{children}</p>,
  },
  marks: {
    link: ({ children, value }: any) => (
      <Link href={value?.href || '#'} className="underline text-[#22C55E] hover:text-[#15803d]">{children}</Link>
    ),
  },
};
