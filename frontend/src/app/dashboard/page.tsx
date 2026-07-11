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
} from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Fetching workspace metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20 p-6">
        <div className="flex flex-col items-center space-y-2 text-red-400">
          <AlertCircle className="h-10 w-10" />
          <h3 className="text-lg font-bold">Failed to load analytics</h3>
          <p className="text-sm text-slate-400">Please verify connection or try again later.</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  if (isAdmin) {
    // Admin Dashboard Render
    const { totalEmployees, totalProjects, totalTasks, taskCompletion, projectProgress, recentActivities } = stats;

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Console</h1>
          <p className="text-sm text-slate-400">Workspace status, projects aggregate, and operational logs.</p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Employees</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{totalEmployees}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-indigo-400">
              <TrendingUp className="h-4 w-4" />
              <span>Workspace accounts active</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Projects</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{totalProjects}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <FolderGit2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-violet-400">
              <TrendingUp className="h-4 w-4" />
              <span>Active client & internal spaces</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Tasks</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{totalTasks}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-emerald-400">
              <span>{taskCompletion.completed} completed task items</span>
            </div>
          </div>
        </div>

        {/* Breakdown Columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tasks & Projects Breakdown */}
          <div className="rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white">Status Breakdown</h3>
            
            {/* Task progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Task Completion Rate</span>
                <span className="text-white">
                  {totalTasks > 0 ? Math.round((taskCompletion.completed / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (taskCompletion.completed / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-3">
                <span className="text-xs text-slate-400 font-medium">To Do</span>
                <p className="text-xl font-bold text-white mt-1">{taskCompletion.breakdown.todo}</p>
              </div>
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-3">
                <span className="text-xs text-slate-400 font-medium">In Progress</span>
                <p className="text-xl font-bold text-indigo-400 mt-1">{taskCompletion.breakdown.inProgress}</p>
              </div>
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-3">
                <span className="text-xs text-slate-400 font-medium">In Review</span>
                <p className="text-xl font-bold text-violet-400 mt-1">{taskCompletion.breakdown.review}</p>
              </div>
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-3">
                <span className="text-xs text-slate-400 font-medium">Completed</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{taskCompletion.breakdown.completed}</p>
              </div>
            </div>

            {/* Project status counts */}
            <div className="pt-4 border-t border-slate-900 space-y-3">
              <h4 className="text-sm font-bold text-white">Project States</h4>
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
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Recent Task activity</h3>
            <div className="flex-1 space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act: any) => (
                  <div key={act.id} className="flex items-start justify-between rounded-lg bg-slate-900/40 border border-slate-900/60 p-4 hover:border-slate-800 transition">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">{act.title}</h4>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span>Project: <strong className="text-slate-300">{act.projectName}</strong></span>
                        <span>•</span>
                        <span>Assignee: <strong className="text-slate-300">{act.assigneeName}</strong></span>
                      </div>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      act.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      act.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      act.status === 'Review' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
                  No task activity recorded yet.
                </div>
              )}
            </div>
            {totalTasks > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-900 text-center">
                <Link href="/dashboard/tasks" className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                  <span>Manage Task Board</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-400">Here's a digest of your assigned projects, tasks, and deadlines.</p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">My Projects</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{assignedProjectsCount}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FolderGit2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-indigo-400">
              <span>Assigned spaces & team workspaces</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-violet-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pending Tasks</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{tasksOverview.pending}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-violet-400">
              <span>{tasksOverview.breakdown.inProgress} active in-progress items</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition hover:border-slate-800">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Completed</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{tasksOverview.completed}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-emerald-400">
              <span>{tasksOverview.total} total items assigned</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Priority Spread */}
          <div className="rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-white">Priority & States</h3>
            
            {/* Task state chart mockup */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-4 text-center">
                <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">HIGH</span>
                <p className="text-2xl font-bold text-white mt-2">{priorityDistribution.high}</p>
              </div>
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-4 text-center">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">MEDIUM</span>
                <p className="text-2xl font-bold text-white mt-2">{priorityDistribution.medium}</p>
              </div>
              <div className="rounded-lg bg-slate-900/40 border border-slate-900 p-4 text-center">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">LOW</span>
                <p className="text-2xl font-bold text-white mt-2">{priorityDistribution.low}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-900">
              <h4 className="text-sm font-bold text-white">State breakdown</h4>
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
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h3>
            <div className="flex-1 space-y-4">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline: any) => (
                  <div key={deadline.id} className="flex items-center justify-between rounded-lg bg-slate-900/40 border border-slate-900/60 p-4 hover:border-slate-800 transition">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">{deadline.title}</h4>
                      <p className="text-xs text-slate-400">
                        Project: <strong className="text-slate-300">{deadline.projectName}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1.5">
                      <div className="flex items-center space-x-1 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{new Date(deadline.dueDate).toLocaleDateString()}</span>
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        deadline.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        deadline.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {deadline.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
                  Great job! You have no upcoming deadlines.
                </div>
              )}
            </div>
            {tasksOverview.total > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-900 text-center">
                <Link href="/dashboard/tasks" className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                  <span>Go to My Task Board</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
