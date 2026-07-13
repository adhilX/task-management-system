"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/api";
import { useUserAuthStore } from "../../stores/userAuthStore";
import {
  Folder,
  CheckSquare,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  FileText,
  UserCheck
} from "lucide-react";

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
  const [currentDate, setCurrentDate] = useState("");
  const [timeParts, setTimeParts] = useState({ hours: "", minutes: "", ampm: "" });

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return "Good morning";
    } else if (hours >= 12 && hours < 17) {
      return "Good afternoon";
    } else if (hours >= 17 && hours < 22) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };

  // Dynamically format time to match mockup (e.g. Tuesday, 20 May 2025 | 7:45 PM)
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format Date: "Tuesday, 20 May 2025"
      const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString("en-US", { month: "short" });
      const yearNum = now.getFullYear();
      const dateStr = `${dayName}, ${dayNum} ${monthName} ${yearNum}`;

      setCurrentDate(dateStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: stats, isLoading, error } = useQuery<EmployeeStats>({
    queryKey: ["employeeStats"],
    queryFn: () => apiFetch("/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin" />
        </div>
        <span className="text-brand-primary font-semibold text-xs animate-pulse">Loading workspace metrics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl max-w-md mx-auto mt-6">
        <h3 className="font-bold text-sm mb-1">Sync Error</h3>
        <p className="text-[11px] text-text-muted">Failed to load employee metrics. Please verify your connection and try again.</p>
      </div>
    );
  }

  const totalTasks = stats.tasksOverview.total || 0;
  const highPriority = stats.priorityDistribution.high || 0;
  const mediumPriority = stats.priorityDistribution.medium || 0;
  const lowPriority = stats.priorityDistribution.low || 0;

  const highPercent = totalTasks ? Math.round((highPriority / totalTasks) * 100) : 0;
  const mediumPercent = totalTasks ? Math.round((mediumPriority / totalTasks) * 100) : 0;
  const lowPercent = totalTasks ? Math.round((lowPriority / totalTasks) * 100) : 0;

  // Custom static activity log simulated nicely to match the mockup
  const recentActivities = [
    {
      id: "act-1",
      title: 'Project "Website Redesign" created',
      time: "2 min ago",
      icon: <Folder className="w-4 h-4 text-purple-400" />,
      bg: "bg-purple-500/10 border border-purple-500/20"
    },
    {
      id: "act-2",
      title: 'Task "API integration" completed',
      time: "15 min ago",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      bg: "bg-emerald-500/10 border border-emerald-500/20"
    },
    {
      id: "act-3",
      title: "John Doe assigned you a task",
      time: "1 hour ago",
      icon: <UserCheck className="w-4 h-4 text-amber-400" />,
      bg: "bg-amber-500/10 border border-amber-500/20"
    },
    {
      id: "act-4",
      title: "Design system.pdf uploaded",
      time: "2 hours ago",
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      bg: "bg-sky-500/10 border border-sky-500/20"
    }
  ];

  return (
    <div className="h-auto lg:h-full w-full flex flex-col gap-4">
      {/* Welcome Banner */}
      <div className="py-4 px-6 rounded-2xl bg-bg-card border border-border-card relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 min-h-[110px]">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-brand-primary/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl md:text-2xl font-extrabold text-text-title tracking-tight flex items-center gap-2">
            {getGreeting()}, {userInfo?.name || "Employee"}! <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>
          <p className="text-text-muted text-xs font-semibold mt-1 leading-relaxed">
            Let's make today productive and amazing.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold bg-bg-accent/60 border border-border-accent/55 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>{currentDate || "Tuesday, 20 May 2025"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Card 1: My Projects */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">My Projects</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.assignedProjectsCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-emerald-400">↑ 18%</span>
              <span className="text-text-muted">from last month</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Purple) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 15 15, 30 25 T 60 10 T 90 5 T 100 15"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 15 15, 30 25 T 60 10 T 90 5 T 100 15 L 100 40 L 0 40 Z"
                fill="url(#purpleGrad)"
              />
              <circle cx="90" cy="5" r="2.5" fill="#ffffff" stroke="#c084fc" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Tasks</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.tasksOverview.total}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-emerald-400">↑ 12%</span>
              <span className="text-text-muted">from last month</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Green) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 20 15, 40 30 T 70 8 T 90 4 T 100 18"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 35 Q 20 15, 40 30 T 70 8 T 90 4 T 100 18 L 100 40 L 0 40 Z"
                fill="url(#greenGrad)"
              />
              <circle cx="90" cy="4" r="2.5" fill="#ffffff" stroke="#34d399" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:scale-105 transition-transform shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Completed</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.tasksOverview.completed}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-emerald-400">↑ 8%</span>
              <span className="text-text-muted">from last month</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Orange) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 30 Q 15 35, 35 15 T 70 25 T 90 7 T 100 12"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 30 Q 15 35, 35 15 T 70 25 T 90 7 T 100 12 L 100 40 L 0 40 Z"
                fill="url(#orangeGrad)"
              />
              <circle cx="90" cy="7" r="2.5" fill="#ffffff" stroke="#fb923c" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 4: In Progress */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex items-center justify-between group shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">In Progress</span>
                <span className="text-2xl font-black text-text-title tracking-tight block mt-0.5">{stats.tasksOverview.breakdown.inProgress}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="text-rose-500">↓ 4%</span>
              <span className="text-text-muted">from last month</span>
            </div>
          </div>
          {/* Custom SVG Sparkline (Blue) */}
          <div className="w-20 h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 15 Q 25 10, 50 35 T 85 15 T 100 28"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0 15 Q 25 10, 50 35 T 85 15 T 100 28 L 100 40 L 0 40 Z"
                fill="url(#blueGrad)"
              />
              <circle cx="85" cy="15" r="2.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid: Deadlines, distribution, activity and productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-grow lg:flex-1 lg:min-h-0">
        {/* Left column (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:h-full lg:min-h-0">
          {/* Upcoming Deadlines */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col justify-between lg:flex-1 lg:min-h-0 overflow-hidden">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-text-title text-xs tracking-tight">Upcoming Deadlines</h3>
                <a href="/dashboard/tasks" className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-bold transition-colors">
                  View All
                </a>
              </div>

              <div className="space-y-2">
                {stats.upcomingDeadlines.length === 0 ? (
                  /* Catchy caught-up empty state matching the mockup */
                  <div className="flex flex-col items-center justify-center text-center py-2 space-y-2">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-bg-accent border border-border-accent flex items-center justify-center text-brand-primary shadow-inner">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-bg-card flex items-center justify-center text-white text-[8px] font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-text-title text-xs">You're all caught up!</h4>
                      <p className="text-[10px] text-text-muted max-w-[220px]">No pending tasks with upcoming due dates.</p>
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 active:scale-95 text-brand-btn-text font-bold text-[10px] rounded-lg shadow-md transition-all cursor-pointer">
                      <Plus className="w-3 h-3" />
                      <span>Create Task</span>
                    </button>
                  </div>
                ) : (
                  stats.upcomingDeadlines.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-bg-input/80 border border-border-input/60 rounded-xl flex items-center justify-between gap-3 hover:border-border-accent/80 hover:bg-bg-accent/40 transition duration-150 group"
                    >
                      <div>
                        <h4 className="text-[11px] font-bold text-text-title group-hover:text-brand-primary transition-colors">{task.title}</h4>
                        <p className="text-[9px] text-text-muted font-semibold mt-0.5">Project: {task.projectName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[8px] font-bold border mb-1 ${task.priority === "high"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : task.priority === "medium"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-bg-accent text-text-muted border-border-card"
                          }`}>
                          {task.priority}
                        </span>
                        <p className="text-[9px] text-text-muted font-semibold">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col lg:flex-1 lg:min-h-0 overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-text-title text-xs tracking-tight">Recent Activity</h3>
              <button className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-bold transition-colors">
                View All
              </button>
            </div>

            <div className="divide-y divide-border-card/40 flex-1 overflow-hidden">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-bg-accent/10 rounded-xl px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${act.bg} flex items-center justify-center shrink-0`}>
                      {act.icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-text-title group-hover:text-brand-primary transition-colors">{act.title}</p>
                      <p className="text-[9px] text-text-muted font-semibold mt-0.5">{act.time}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-body group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4 lg:h-full lg:min-h-0">
          {/* Priority Distribution */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col justify-between lg:flex-1 lg:min-h-0 overflow-hidden">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-text-title text-xs tracking-tight">Priority Distribution</h3>
                <button className="text-[10px] text-brand-primary hover:text-brand-primary/80 font-bold transition-colors">
                  View Report
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center mt-3">
                <div className="flex flex-row items-center justify-around gap-6 w-full px-2">
                  {/* SVG Donut Chart */}
                  <div className="relative w-[90px] h-[90px] flex items-center justify-center shrink-0">
                    <div className="absolute inset-0">
                      <svg width="90" height="90" viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                        {totalTasks === 0 ? (
                          <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="var(--border-card)" strokeWidth="4" />
                        ) : (
                          <>
                            <circle cx="20" cy="20" r="15.9155" fill="transparent" stroke="var(--bg-accent)" strokeWidth="4" />

                            {/* Low priority (emerald-500) */}
                            {lowPercent > 0 && (
                              <circle
                                cx="20"
                                cy="20"
                                r="15.9155"
                                fill="transparent"
                                stroke="#10b981"
                                strokeWidth="4.2"
                                strokeDasharray={`${lowPercent} ${100 - lowPercent}`}
                                strokeDashoffset={-(highPercent + mediumPercent)}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            )}

                            {/* Medium priority (amber-500) */}
                            {mediumPercent > 0 && (
                              <circle
                                cx="20"
                                cy="20"
                                r="15.9155"
                                fill="transparent"
                                stroke="#f59e0b"
                                strokeWidth="4.2"
                                strokeDasharray={`${mediumPercent} ${100 - mediumPercent}`}
                                strokeDashoffset={-highPercent}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            )}

                            {/* High priority (red-500) */}
                            {highPercent > 0 && (
                              <circle
                                cx="20"
                                cy="20"
                                r="15.9155"
                                fill="transparent"
                                stroke="#ef4444"
                                strokeWidth="4.2"
                                strokeDasharray={`${highPercent} ${100 - highPercent}`}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            )}
                          </>
                        )}
                      </svg>
                    </div>

                    {/* Center values */}
                    <div className="text-center z-10">
                      <span className="block text-xl font-black text-text-title tracking-tight leading-none">{totalTasks}</span>
                      <span className="block text-[8px] uppercase tracking-wider text-text-muted font-bold mt-0.5">Total Tasks</span>
                    </div>
                  </div>

                  {/* Legend list matching style */}
                  <div className="space-y-2.5 shrink-0 w-44">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <div className="flex items-center gap-2 text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-red-500 block" />
                        <span>High Priority</span>
                      </div>
                      <span className="text-text-title font-bold">{highPriority} <span className="text-text-muted font-medium">({highPercent}%)</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <div className="flex items-center gap-2 text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                        <span>Medium Priority</span>
                      </div>
                      <span className="text-text-title font-bold">{mediumPriority} <span className="text-text-muted font-medium">({mediumPercent}%)</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <div className="flex items-center gap-2 text-text-muted">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                        <span>Low Priority</span>
                      </div>
                      <span className="text-text-title font-bold">{lowPriority} <span className="text-text-muted font-medium">({lowPercent}%)</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Overview */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col justify-between lg:flex-1 lg:min-h-0 overflow-hidden">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-text-title text-xs tracking-tight">Productivity Overview</h3>

                {/* Select Filter */}
                <div className="relative">
                  <select className="appearance-none bg-bg-input/80 border border-border-input text-[9px] text-brand-primary font-bold px-2 py-1 pr-6 rounded-lg focus:outline-none focus:border-brand-primary transition-colors cursor-pointer">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary text-[7px] font-bold">▼</span>
                </div>
              </div>

              {/* Weekly spline chart (SVG) */}
              <div className="flex-1 flex items-center justify-center w-full min-h-0 mt-3">
                <svg viewBox="0 0 350 120" className="w-full h-full max-h-[150px] overflow-visible">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines with labels */}
                  {[
                    { val: "100%", y: 15 },
                    { val: "75%", y: 37.5 },
                    { val: "50%", y: 60 },
                    { val: "25%", y: 82.5 },
                    { val: "0%", y: 105 }
                  ].map((grid) => (
                    <g key={grid.val}>
                      <text x="22" y={grid.y + 3} fill="var(--text-muted)" fontSize="8" fontWeight="bold" textAnchor="end">
                        {grid.val}
                      </text>
                      <line x1="32" y1={grid.y} x2="335" y2={grid.y} stroke="var(--border-card)" strokeWidth="1" strokeDasharray="3 3" />
                    </g>
                  ))}

                  {/* Bezier spline curve */}
                  <path
                    d="M 45 51 C 70 51, 70 28.5, 92.5 28.5 C 115 28.5, 115 51, 140 51 C 165 51, 165 60, 187.5 60 C 210 60, 210 24, 235 24 C 260 24, 260 46.5, 282.5 46.5 C 305 46.5, 305 87, 330 87"
                    fill="none"
                    stroke="var(--brand-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 45 51 C 70 51, 70 28.5, 92.5 28.5 C 115 28.5, 115 51, 140 51 C 165 51, 165 60, 187.5 60 C 210 60, 210 24, 235 24 C 260 24, 260 46.5, 282.5 46.5 C 305 46.5, 305 87, 330 87 L 330 105 L 45 105 Z"
                    fill="url(#chartGrad)"
                  />

                  {/* Interactive dots */}
                  {[
                    { label: "Mon", x: 45, y: 51 },
                    { label: "Tue", x: 92.5, y: 28.5 },
                    { label: "Wed", x: 140, y: 51 },
                    { label: "Thu", x: 187.5, y: 60 },
                    { label: "Fri", x: 235, y: 24 },
                    { label: "Sat", x: 282.5, y: 46.5 },
                    { label: "Sun", x: 330, y: 87 }
                  ].map((pt) => (
                    <g key={pt.label}>
                      <circle cx={pt.x} cy={pt.y} r="3" fill="var(--bg-card)" stroke="var(--brand-primary)" strokeWidth="2" />
                      <text x={pt.x} y="120" fill="var(--text-muted)" fontSize="8" fontWeight="bold" textAnchor="middle">
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
