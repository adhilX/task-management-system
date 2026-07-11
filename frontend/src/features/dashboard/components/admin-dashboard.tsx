import React from 'react';
import {
  Users,
  FolderGit2,
  CheckCircle2,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { Card, StatsCard } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import EmptyState from '@/components/shared/empty-state';
import { DashboardStats } from '@/types';

interface AdminDashboardProps {
  stats: DashboardStats;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const {
    totalEmployees = 0,
    totalProjects = 0,
    totalTasks = 0,
    taskCompletion = { completed: 0, breakdown: { todo: 0, inProgress: 0, review: 0, completed: 0 } },
    projectProgress = { planning: 0, active: 0, completed: 0, onHold: 0 },
    recentActivities = [],
  } = stats;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">System Console</h1>
        <p className="text-sm text-slate-400 mt-1">Workspace status, projects aggregate, and operational logs.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Employees"
          value={totalEmployees}
          icon={Users}
          color="indigo"
          description="Workspace accounts active"
        />
        <StatsCard
          title="Projects"
          value={totalProjects}
          icon={FolderGit2}
          color="violet"
          description="Active client & internal spaces"
        />
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={CheckCircle2}
          color="emerald"
          description={`${taskCompletion.completed} completed task items`}
        />
      </div>

      {/* Breakdown Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tasks & Projects Breakdown */}
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight">Status Breakdown</h3>
          
          {/* Task progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Task Completion Rate</span>
              <span className="text-white">
                {totalTasks > 0 ? Math.round((taskCompletion.completed / totalTasks) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${totalTasks > 0 ? (taskCompletion.completed / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">To Do</span>
              <p className="text-2xl font-bold text-white mt-1">{taskCompletion.breakdown.todo}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">In Progress</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{taskCompletion.breakdown.inProgress}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">In Review</span>
              <p className="text-2xl font-bold text-violet-400 mt-1">{taskCompletion.breakdown.review}</p>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-slate-900 p-4">
              <span className="text-xs text-slate-400 font-medium">Completed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{taskCompletion.breakdown.completed}</p>
            </div>
          </div>

          {/* Project status counts */}
          <div className="pt-4 border-t border-slate-900/60 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Project States</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Planning</span>
              <span className="font-bold text-white">{projectProgress.planning}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Active</span>
              <span className="font-bold text-indigo-400">{projectProgress.active}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Completed</span>
              <span className="font-bold text-emerald-400">{projectProgress.completed}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">On Hold</span>
              <span className="font-bold text-amber-400">{projectProgress.onHold}</span>
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="flex flex-col">
          <h3 className="text-lg font-bold text-white tracking-tight mb-4">Recent Task Activity</h3>
          <div className="flex-1 space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((act: any) => (
                <div key={act.id} className="flex items-start justify-between rounded-xl bg-slate-900/40 border border-slate-900/80 p-4 hover:border-slate-800 transition-colors">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-white leading-snug">{act.title}</h4>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                      <span>Project: <strong className="text-slate-300">{act.projectName}</strong></span>
                      <span>•</span>
                      <span>Assignee: <strong className="text-slate-300">{act.assigneeName}</strong></span>
                    </div>
                  </div>
                  <Badge variant={
                    act.status === 'Completed' ? 'emerald' :
                    act.status === 'In Progress' ? 'indigo' :
                    act.status === 'Review' ? 'violet' :
                    'slate'
                  } glow={act.status === 'Completed' || act.status === 'In Progress'}>
                    {act.status}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Inbox}
                title="No Task Activity"
                description="Workspace tasks are quiet. Activity logs will appear as team members transition task states."
              />
            )}
          </div>
          {totalTasks > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-900/60 text-center">
              <Link href="/dashboard/tasks" className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                <span>Manage Task Board</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
