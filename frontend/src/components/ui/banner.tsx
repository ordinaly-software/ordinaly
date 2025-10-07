
import React from 'react';
import Image from 'next/image';

interface BannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  filters?: React.ReactNode;
  searchParams?: React.ReactNode;
  children?: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  filters,
  searchParams,
  children,
}) => {
  return (
    <div className="relative w-full min-h-[320px] md:min-h-[420px] flex flex-col justify-center items-center text-center overflow-hidden">
      {/* Background Layer: Image or Video */}
      {backgroundVideo ? (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 blur-md"
          src={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : backgroundImage ? (
        <Image
          src={backgroundImage}
          alt="Banner background"
          fill
          className="absolute inset-0 w-full h-full object-cover z-0 blur-sm"
          priority
          loading="eager"
          sizes="100vw"
        />
      ) : null}
      {/* Overlay for darkening */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      {/* Content */}
      <div className="relative z-20 px-4 py-12 md:py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">{title}</h1>
        {subtitle && <p className="text-xl text-white dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">{subtitle}</p>}
        <br />
        {filters && <div className="mb-2">{filters}</div>}
        {searchParams && <div className="mb-2">{searchParams}</div>}
        {children}
      </div>
    </div>
  );
};

export default Banner;
