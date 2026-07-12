"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/api";

interface StatsData {
  totalEmployees: number;
  totalProjects: number;
  totalTasks: number;
  taskCompletion: {
    completed: number;
    pending: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  projectProgress: {
    planning: number;
    active: number;
    completed: number;
    onHold: number;
  };
  recentActivities: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    updatedAt: string;
    assigneeName: string;
    projectName: string;
  }>;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ["adminStats"],
    queryFn: () => apiFetch("/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-400 text-sm">Fetching overview statistics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-400 border border-red-500/20 bg-red-500/10 rounded-2xl">
        Failed to load statistics. Please ensure you are logged in as Admin and try again.
      </div>
    );
  }

  const statCards = [
    { name: "Total Employees", value: stats.totalEmployees, icon: "👥", description: "Active team members" },
    { name: "Total Projects", value: stats.totalProjects, icon: "📁", description: "Active & planned projects" },
    { name: "Total Tasks", value: stats.totalTasks, icon: "📋", description: "Sprint tasks created" },
    { name: "Completed Tasks", value: stats.taskCompletion.completed, icon: "✅", description: `${Math.round((stats.taskCompletion.completed / (stats.totalTasks || 1)) * 100)}% completion rate` },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time statistics across active projects and team operations.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-slate-700/80 transition duration-150">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">{card.name}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight mt-4">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-1">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Breakdowns section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project States */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <h3 className="font-bold text-white tracking-tight mb-4">Project States</h3>
          <div className="space-y-3">
            {[
              { label: "Active Projects", value: stats.projectProgress.active, color: "bg-indigo-500" },
              { label: "Planning Stage", value: stats.projectProgress.planning, color: "bg-yellow-500" },
              { label: "Completed Projects", value: stats.projectProgress.completed, color: "bg-emerald-500" },
              { label: "On Hold", value: stats.projectProgress.onHold, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{
                      width: `${(item.value / (stats.totalProjects || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task States breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <h3 className="font-bold text-white tracking-tight mb-4">Task Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Todo", value: stats.taskCompletion.breakdown.todo, color: "bg-slate-500" },
              { label: "In Progress", value: stats.taskCompletion.breakdown.inProgress, color: "bg-blue-500" },
              { label: "In Review", value: stats.taskCompletion.breakdown.review, color: "bg-amber-500" },
              { label: "Completed", value: stats.taskCompletion.breakdown.completed, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{
                      width: `${(item.value / (stats.totalTasks || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Activity */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <h3 className="font-bold text-white tracking-tight mb-4">Recent Actions</h3>
          <div className="space-y-4">
            {stats.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent task logs found.</p>
            ) : (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-relaxed">
                  <div className="h-6 w-6 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-sm">
                    📝
                  </div>
                  <div>
                    <p className="text-slate-300">
                      Task <span className="font-semibold text-white">#{act.id} ({act.title})</span> was updated.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Project: {act.projectName} | Assignee: {act.assigneeName}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
