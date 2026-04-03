'use client';
import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = ERROR_IMG_SRC,
  className,
  style,
  fetchPriority,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [didError, setDidError] = useState(false);

  // Handle empty or null src
  const isValidSrc = typeof src === 'string' && src.trim() !== '';

  if (!isValidSrc || didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle overflow-hidden ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full relative">
          <Image
            src={fallbackSrc}
            alt="Fallback image"
            fill
            className="object-contain p-4 opacity-50"
          />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => {
        setDidError(true);
      }}
    />
  );
}
