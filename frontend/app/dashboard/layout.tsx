"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useUserAuthStore } from "../../stores/userAuthStore";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { userInfo, isAuthenticated, logout } = useUserAuthStore();

  // Set hydration complete state on mount
  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Verifying Session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "My Projects", path: "/dashboard/projects", icon: "📁" },
    { name: "My Tasks", path: "/dashboard/tasks", icon: "📋" },
    { name: "Profile", path: "/dashboard/profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl shrink-0">
        {/* Branding */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-sm block">TaskSphere</span>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block -mt-1">
              Employee Portal
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                pathname === item.path
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {userInfo?.name?.substring(0, 2).toUpperCase() || "EM"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{userInfo?.name || "Employee"}</p>
              <p className="text-[10px] text-slate-500 truncate">{userInfo?.email || "employee@company.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition duration-150"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/20 backdrop-blur-xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              ☰
            </button>
            <h2 className="font-semibold text-white text-base">My Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Department: {userInfo?.department || "General"}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
              🔔
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 animate-slide-in">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-white">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-grow space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:text-white hover:bg-red-500 rounded-xl text-xs font-semibold transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Panel Page */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
