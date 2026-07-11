import React from 'react';
import {
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, StatsCard } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import EmptyState from '@/components/shared/empty-state';
import { DashboardStats, User } from '@/types';

interface EmployeeDashboardProps {
  stats: DashboardStats;
  currentUser: User | null;
}

export function EmployeeDashboard({ stats, currentUser }: EmployeeDashboardProps) {
  const {
    assignedProjectsCount = 0,
    tasksOverview = { pending: 0, completed: 0, total: 0, breakdown: { todo: 0, inProgress: 0, review: 0, completed: 0 } },
    priorityDistribution = { high: 0, medium: 0, low: 0 },
    upcomingDeadlines = [],
  } = stats;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Welcome back, {currentUser?.name}</h1>
        <p className="text-sm text-slate-400 mt-1">Here's a digest of your assigned projects, tasks, and deadlines.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="My Projects"
          value={assignedProjectsCount}
          icon={FolderGit2}
          color="indigo"
          description="Assigned spaces & team workspaces"
        />
        <StatsCard
          title="Pending Tasks"
          value={tasksOverview.pending}
          icon={AlertCircle}
          color="violet"
          description={`${tasksOverview.breakdown.inProgress} active in-progress items`}
        />
        <StatsCard
          title="Completed"
          value={tasksOverview.completed}
          icon={CheckCircle2}
          color="emerald"
          description={`${tasksOverview.total} total items assigned`}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Priority Spread */}
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">Priority & States</h3>
          
          {/* Task state chart mockup */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4 text-center flex flex-col items-center justify-between">
              <Badge variant="red" glow className="text-[10px] px-2 py-0">HIGH</Badge>
              <p className="text-2xl font-bold text-white mt-2.5 leading-none">{priorityDistribution.high}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4 text-center flex flex-col items-center justify-between">
              <Badge variant="amber" glow className="text-[10px] px-2 py-0">MEDIUM</Badge>
              <p className="text-2xl font-bold text-white mt-2.5 leading-none">{priorityDistribution.medium}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4 text-center flex flex-col items-center justify-between">
              <Badge variant="indigo" glow className="text-[10px] px-2 py-0">LOW</Badge>
              <p className="text-2xl font-bold text-white mt-2.5 leading-none">{priorityDistribution.low}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-900/60">
            <h4 className="text-sm font-bold text-white tracking-tight">State Breakdown</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">To Do</span>
              <span className="font-semibold text-white">{tasksOverview.breakdown.todo}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">In Progress</span>
              <span className="font-semibold text-indigo-400">{tasksOverview.breakdown.inProgress}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">In Review</span>
              <span className="font-semibold text-violet-400">{tasksOverview.breakdown.review}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Completed</span>
              <span className="font-semibold text-emerald-400">{tasksOverview.breakdown.completed}</span>
            </div>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="flex flex-col">
          <h3 className="text-lg font-bold text-white tracking-tight mb-4">Upcoming Deadlines</h3>
          <div className="flex-1 space-y-4">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline: any) => (
                <div key={deadline.id} className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-900/80 p-4 hover:border-slate-800 transition-colors">
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate leading-snug">{deadline.title}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      Project: <strong className="text-slate-300">{deadline.projectName}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 shrink-0 ml-4">
                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={
                      deadline.priority === 'High' ? 'red' :
                      deadline.priority === 'Medium' ? 'amber' :
                      'indigo'
                    } className="text-[10px] px-2 py-0">
                      {deadline.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No Upcoming Deadlines"
                description="Outstanding work is fully up to date. Rest easy or take on new tasks from the board."
              />
            )}
          </div>
          {tasksOverview.total > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-900/60 text-center">
              <Link href="/dashboard/tasks" className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                <span>Go to My Task Board</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
