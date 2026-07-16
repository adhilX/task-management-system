"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../../services/dashboard.service";
import { 
  Users, 
  Folder, 
  ClipboardList, 
  CheckCircle2, 
  FileText, 
  Calendar,
  ChevronRight,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserCheck
} from "lucide-react";

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

const timeAgo = (dateStr?: string | Date) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function AdminDashboardPage() {
  const [currentDate, setCurrentDate] = useState("");

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "Good morning";
    if (hours >= 12 && hours < 17) return "Good afternoon";
    if (hours >= 17 && hours < 22) return "Good evening";
    return "Good night";
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString("en-US", { month: "short" });
      const yearNum = now.getFullYear();
      setCurrentDate(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: stats, isLoading, error } = useQuery<StatsData>({
    queryKey: ["adminStats"],
    queryFn: () => dashboardService.getStats(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
        </div>
        <span className="text-emerald-500 font-semibold text-xs animate-pulse">Fetching overview statistics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl max-w-md mx-auto mt-6">
        <h3 className="font-bold text-sm mb-1">Sync Error</h3>
        <p className="text-[11px] text-text-muted">Failed to load admin statistics. Please verify authorization and try again.</p>
      </div>
    );
  }

  const completionRate = Math.round(((stats?.taskCompletion?.completed || 0) / (stats?.totalTasks || 1)) * 100);

  return (
    <div className="h-auto lg:h-full w-full flex flex-col gap-4">
      {/* Welcome Banner */}
      <div className="py-4 px-6 rounded-2xl bg-bg-card border border-border-card relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 min-h-[110px]">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl md:text-2xl font-extrabold text-text-title tracking-tight flex items-center gap-2">
            {getGreeting()}, Admin! <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>
          <p className="text-text-muted text-xs font-semibold mt-1 leading-relaxed">
            Here's the current state of active projects and workspace activities.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold bg-bg-accent/60 border border-border-accent/55 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentDate || "Tuesday, 20 May 2025"}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              System Admin
            </span>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Card 1: Total Employees */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Employees</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.totalEmployees}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-emerald-400">Active team members</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Teal/Emerald) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 15 15, 30 25 T 60 10 T 90 5 T 100 15"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 15 15, 30 25 T 60 10 T 90 5 T 100 15 L 100 40 L 0 40 Z"
                fill="url(#tealGrad)"
              />
              <circle cx="90" cy="5" r="2.5" fill="#ffffff" stroke="#14b8a6" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Projects */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Projects</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.totalProjects}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-blue-400">Active & planned</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Blue) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="blueGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 20 15, 40 30 T 70 8 T 90 4 T 100 18"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 20 15, 40 30 T 70 8 T 90 4 T 100 18 L 100 40 L 0 40 Z"
                fill="url(#blueGradAdmin)"
              />
              <circle cx="90" cy="4" r="2.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Tasks */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Tasks</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.totalTasks}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-purple-400">Sprint tasks created</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Purple) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="purpleGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 30 Q 15 35, 35 15 T 70 25 T 90 7 T 100 12"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 30 Q 15 35, 35 15 T 70 25 T 90 7 T 100 12 L 100 40 L 0 40 Z"
                fill="url(#purpleGradAdmin)"
              />
              <circle cx="90" cy="7" r="2.5" fill="#ffffff" stroke="#a855f7" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Completed Tasks</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats?.taskCompletion?.completed ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-emerald-400">{completionRate}% completion rate</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Green) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="emeraldGradAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 15 Q 25 10, 50 35 T 85 15 T 100 28"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 15 Q 25 10, 50 35 T 85 15 T 100 28 L 100 40 L 0 40 Z"
                fill="url(#emeraldGradAdmin)"
              />
              <circle cx="85" cy="15" r="2.5" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid: Breakdowns and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Project States */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md">
          <h3 className="font-bold text-text-title tracking-tight mb-4 text-sm">Project States</h3>
          <div className="space-y-4">
            {[
              { label: "Active Projects", value: stats?.projectProgress?.active ?? 0, color: "bg-emerald-500" },
              { label: "Planning Stage", value: stats?.projectProgress?.planning ?? 0, color: "bg-yellow-500" },
              { label: "Completed Projects", value: stats?.projectProgress?.completed ?? 0, color: "bg-blue-500" },
              { label: "On Hold", value: stats?.projectProgress?.onHold ?? 0, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-title">{item.value}</span>
                </div>
                <div className="h-1.5 w-full bg-bg-accent rounded-full overflow-hidden border border-border-card/30">
                  <div
                     className={`h-full ${item.color} rounded-full`}
                     style={{
                       width: `${(item.value / (stats?.totalProjects || 1)) * 100}%`,
                     }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task States breakdown */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md">
          <h3 className="font-bold text-text-title tracking-tight mb-4 text-sm">Task Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Todo", value: stats?.taskCompletion?.breakdown?.todo ?? 0, color: "bg-slate-500" },
              { label: "In Progress", value: stats?.taskCompletion?.breakdown?.inProgress ?? 0, color: "bg-blue-500" },
              { label: "In Review", value: stats?.taskCompletion?.breakdown?.review ?? 0, color: "bg-amber-500" },
              { label: "Completed", value: stats?.taskCompletion?.breakdown?.completed ?? 0, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-title">{item.value}</span>
                </div>
                <div className="h-1.5 w-full bg-bg-accent rounded-full overflow-hidden border border-border-card/30">
                  <div
                     className={`h-full ${item.color} rounded-full`}
                     style={{
                       width: `${(item.value / (stats?.totalTasks || 1)) * 100}%`,
                     }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions list with assignee bubbles */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col">
          <h3 className="font-bold text-text-title tracking-tight mb-4 text-sm">Recent Actions</h3>
          <div className="space-y-4 flex-1 overflow-hidden">
            {stats.recentActivities.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No recent task logs found.</p>
            ) : (
              stats.recentActivities.map((act) => {
                const isCompleted = act.status?.toLowerCase() === "completed";
                const isInProgress = act.status?.toLowerCase() === "in progress" || act.status?.toLowerCase() === "in-progress";
                const isReview = act.status?.toLowerCase() === "review";

                let statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                if (isCompleted) {
                  statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                } else if (isInProgress) {
                  statusColor = "bg-sky-500/10 text-sky-500 border-sky-500/20";
                } else if (isReview) {
                  statusColor = "bg-purple-500/10 text-purple-500 border-purple-500/20";
                }

                return (
                  <div key={act.id} className="flex gap-3 text-xs leading-relaxed group hover:bg-bg-accent/20 p-1.5 rounded-xl transition duration-150">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-500 text-[10px] shrink-0">
                      {getInitials(act.assigneeName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-title font-semibold truncate">
                        Task <span className="font-mono text-[10px] text-text-muted">#{act.id.substring(18)}</span> ("{act.title}")
                      </p>
                      <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">
                        Project: {act.projectName} &bull; {timeAgo(act.updatedAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold border capitalize ${statusColor}`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
