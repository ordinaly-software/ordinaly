"use client";

import React from 'react';

interface Props {
  placeId?: string; // optional if you will use server lookup
  label?: string; // localized label
  className?: string;
  showStars?: boolean; // if you fetch rating from server, pass it as prop
  rating?: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
}

export default function RateOnGoogle({
  placeId,
  label = 'Comparte tu opinión en Google',
  className = '',
  showStars = false,
  rating,
  reviews,
  size = 'md',
  variant = 'default',
}: Props) {
  const sizeClasses = size === 'sm' ? 'text-sm px-2 py-1' : size === 'lg' ? 'text-base px-3 py-2' : 'text-sm px-2.5 py-1.5';
  const variantClasses = variant === 'ghost' ? 'bg-transparent text-green-700 hover:bg-green-50' : 'bg-white text-green-700 shadow-sm hover:shadow-md';
  const openWriteReview = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!placeId) return; // silently ignore if not configured
    const url = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
      placeId
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {showStars && typeof rating === 'number' && (
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
          <span className="font-semibold mr-1">{rating.toFixed(1)}</span>

          <span className="text-xs">★</span>
          {typeof reviews === 'number' && (
            <span className="ml-2 text-xs text-gray-500">({reviews})</span>
          )}
        </div>
      )}

      <button
        onClick={placeId ? openWriteReview : undefined}
        disabled={!placeId}
        aria-disabled={!placeId}
        title={!placeId ? 'Rate on Google not configured' : label}
        className={`inline-flex items-center gap-2 rounded-full ${sizeClasses} ${variantClasses} ${
          !placeId ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={label}
        type="button"
      >
        {/* Google "G" icon (simple) */}
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21.35 11.1h-9.4v2.9h5.4c-.35 1.9-2.15 3.6-5.4 3.6-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.8 3.8 1.5l2.6-2.5C18.2 3.3 16.1 2.2 13.95 2.2 8.9 2.2 4.9 6 4.9 11s4 8.8 9.05 8.8c5.2 0 8.95-3.65 8.95-8.8 0-.6-.05-1.05-.6-1.1z" fill="#4285F4"/>
          </svg>
        </span>
        <span className="font-medium text-sm text-gray-800 dark:text-white">{label}</span>
      </button>
    </div>
  );
}
