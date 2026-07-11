'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Users,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { Card, StatsCard } from '@/components/shared/card';
import Badge from '@/components/shared/badge';
import EmptyState from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats', user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'Admin' ? '/dashboard/admin' : '/dashboard/employee';
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-800/60 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 bg-slate-900/20 border border-slate-900 rounded-xl"></div>
          <div className="h-80 bg-slate-900/20 border border-slate-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-red-950/30 bg-red-950/10 p-8 text-center max-w-xl mx-auto">
        <div className="flex flex-col items-center space-y-3 text-red-400">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-white">Failed to Load Dashboard</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            There was an issue fetching system analytics. Please verify your internet connection or backend services.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  if (isAdmin) {
    const { totalEmployees, totalProjects, totalTasks, taskCompletion, projectProgress, recentActivities } = stats;

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
  } else {
    // Employee Dashboard Render
    const { assignedProjectsCount, tasksOverview, priorityDistribution, upcomingDeadlines } = stats;

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Welcome back, {user?.name}</h1>
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
}
