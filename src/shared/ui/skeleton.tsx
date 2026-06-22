import { type CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';

type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  /** For text variant: number of lines to render */
  lines?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  lines = 1,
}: SkeletonProps) {
  const baseStyle = 'animate-pulse bg-slate-800 rounded';

  const style: CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height:
      height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (variant === 'text') {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...style,
              width: i === lines - 1 && lines > 1 ? '75%' : style.width,
            }}
            className={cn(baseStyle, 'h-4', className)}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        style={style}
        className={cn(baseStyle, '!rounded-full', !height && 'h-10', !width && 'w-10', className)}
      />
    );
  }

  // rectangular
  return (
    <div
      style={style}
      className={cn(baseStyle, '!rounded-xl', !height && 'h-24', className)}
    />
  );
}
