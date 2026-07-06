// Skeleton: placeholder blocks while data loads. Uses the shimmer animation
// defined in tailwind.config.js.

import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={clsx('skeleton h-4', className)} />
        ))}
      </div>
    );
  }
  return <div className={clsx('skeleton', className)} />;
}

export function GuideCardSkeleton() {
  return (
    <div className="rounded bg-bg-card border border-bg-hover p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}