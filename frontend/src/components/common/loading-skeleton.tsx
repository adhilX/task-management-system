import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/60 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-900 bg-slate-900/25 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-4 overflow-hidden rounded-xl border border-slate-900 bg-slate-900/20 p-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton 
                key={j} 
                className={`h-4 ${
                  j === 0 ? 'w-1/3' : j === 1 ? 'w-1/6' : j === 2 ? 'w-1/5' : 'w-1/12 ml-auto'
                }`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
