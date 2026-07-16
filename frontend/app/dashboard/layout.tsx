"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useUserAuthStore } from "../../stores/userAuthStore";
import ThemeToggle from "../../components/ThemeToggle";
import Sidebar from "../../components/Sidebar";
import { Menu } from "lucide-react";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { userInfo, isAuthenticated, logout } = useUserAuthStore();

  // Set hydration complete state on mount
  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hasHydrated && (!isAuthenticated || userInfo?.role !== "employee")) {
      logout();
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, userInfo, router, logout]);

  if (!hasHydrated || !isAuthenticated || userInfo?.role !== "employee") {
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-dashboard text-text-body flex font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg-dashboard">
        {/* Header */}
        <header className="h-16 border-b border-border-card bg-bg-card/60 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text-title rounded-lg hover:bg-bg-accent"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-text-title text-base tracking-tight">My Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-bg-accent border border-border-accent text-brand-primary text-[10px] px-3 py-1 rounded-full font-bold tracking-wide">
              Department: {userInfo?.department || "Product"}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
            <Sidebar isMobile={true} onCloseMobile={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Panel Page */}
        <main className="flex-grow w-full h-auto lg:h-[calc(100vh-64px)] p-4 md:p-6 overflow-y-auto lg:overflow-hidden">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
