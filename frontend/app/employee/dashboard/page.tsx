"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";
import { useUserAuthStore } from "../../../stores/userAuthStore";

interface EmployeeStats {
  assignedProjectsCount: number;
  tasksOverview: {
    total: number;
    completed: number;
    pending: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate?: string;
    priority: string;
    projectName: string;
  }>;
}

export default function EmployeeDashboardPage() {
  const { userInfo } = useUserAuthStore();

  const { data: stats, isLoading, error } = useQuery<EmployeeStats>({
    queryKey: ["employeeStats"],
    queryFn: () => apiFetch("/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-400 text-sm">Loading your metrics dashboard...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-400 border border-red-500/20 bg-red-500/10 rounded-2xl">
        Failed to load employee metrics. Please verify your session and try again.
      </div>
    );
  }

  const statCards = [
    { name: "My Projects", value: stats.assignedProjectsCount, icon: "📁" },
    { name: "Total Tasks", value: stats.tasksOverview.total, icon: "📋" },
    { name: "Completed", value: stats.tasksOverview.completed, icon: "🎉" },
    { name: "In Progress", value: stats.tasksOverview.breakdown.inProgress, icon: "⚡" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-indigo-900/30 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {userInfo?.name || "Employee"}!</h1>
          <p className="text-sm text-slate-400 mt-1">
            You are assigned to <strong className="text-indigo-400">{stats.assignedProjectsCount} projects</strong> and have <strong className="text-indigo-400">{stats.tasksOverview.pending} pending tasks</strong>.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.name} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">{card.name}</span>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-extrabold text-white tracking-tight mt-3">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Deadlines and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white tracking-tight mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {stats.upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No pending tasks with upcoming due dates.</p>
              ) : (
                stats.upcomingDeadlines.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{task.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Project: {task.projectName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border mb-1 ${
                        task.priority === "high"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-slate-500/10 text-slate-450 border-slate-800"
                      }`}>
                        {task.priority}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Priority distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <h3 className="font-bold text-white tracking-tight mb-4">Priority Distribution</h3>
          <div className="space-y-4 pt-2">
            {[
              { label: "High Priority", value: stats.priorityDistribution.high, color: "bg-red-500" },
              { label: "Medium Priority", value: stats.priorityDistribution.medium, color: "bg-amber-500" },
              { label: "Low Priority", value: stats.priorityDistribution.low, color: "bg-slate-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{
                      width: `${(item.value / (stats.tasksOverview.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
