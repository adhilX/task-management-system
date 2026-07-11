'use client';

import React, { Suspense } from 'react';
import { TaskBoard } from '@/features/tasks/components/task-board';
import { CardSkeleton } from '@/components/common/loading-skeleton';

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 h-full animate-pulse">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      }
    >
      <TaskBoard />
    </Suspense>
  );
}
