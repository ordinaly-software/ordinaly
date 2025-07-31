import React, { forwardRef } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
}

const LazyImage = forwardRef<HTMLDivElement, LazyImageProps>(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL = "data:image/webp;base64,UklGRpQBAABXRUJQVlA4WAoAAAAQAAAADwAACAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKhAACQABQM0JaQAA/v1qAAA=",
  loading = 'lazy',
}, ref) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px 0px',
  });

  // For priority images, load immediately
  if (priority) {
    return (
      <div ref={ref}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }

  return (
    <div ref={targetRef}>
      {isIntersecting ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      ) : (
        <div 
          className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
          style={{ width, height }}
          aria-label={`Loading ${alt}`}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
