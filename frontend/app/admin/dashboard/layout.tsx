"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "../../../stores/adminAuthStore";
import ThemeToggle from "../../../components/ThemeToggle";
import { LayoutDashboard, Users, Folder, ClipboardList, User, Settings, LogOut, Menu, X } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { adminInfo, isAuthenticated, logout } = useAdminAuthStore();

  // Set hydration complete state on mount
  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Verifying Session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Employees", path: "/admin/dashboard/employees", icon: <Users className="w-4 h-4" /> },
    { name: "Projects", path: "/admin/dashboard/projects", icon: <Folder className="w-4 h-4" /> },
    { name: "Tasks", path: "/admin/dashboard/tasks", icon: <ClipboardList className="w-4 h-4" /> },
    { name: "Profile", path: "/admin/dashboard/profile", icon: <User className="w-4 h-4" /> },
    { name: "Settings", path: "/admin/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl shrink-0">
        {/* Branding */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-sm block">TaskFlow</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block -mt-1">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                  isActive
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-slate-400 hover:bg-slate-850 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
              {adminInfo?.name?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{adminInfo?.name || "Administrator"}</p>
              <p className="text-[10px] text-slate-500 truncate">{adminInfo?.email || "admin@company.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-350 hover:text-white hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition duration-150"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
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
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-white text-base">
              {navItems.find((item) => item.path === pathname)?.name || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              System Admin
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-white">Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-grow space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-4 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-850"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:text-white hover:bg-red-500 rounded-xl text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
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
