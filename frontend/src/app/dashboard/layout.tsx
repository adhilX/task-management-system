'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  KanbanSquare,
  UserSquare2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'Admin';

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isAdmin ? [{ name: 'Employees', href: '/dashboard/employees', icon: Users }] : []),
    { name: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
    { name: 'Task Board', href: '/dashboard/tasks', icon: KanbanSquare },
    { name: 'My Profile', href: '/dashboard/profile', icon: UserSquare2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar: Large Devices */}
      <aside className="hidden w-64 flex-col border-r border-slate-900 bg-slate-900/30 backdrop-blur-xl lg:flex">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-900">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="text-lg font-black">J</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">JiraFlow</span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="border-t border-slate-900 p-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-900/40 p-3">
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-semibold text-white">{user.name}</span>
              <span className="truncate text-xs text-slate-500">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-red-400 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xs flex-col bg-slate-900 p-6 shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <Link href="/dashboard" className="flex items-center space-x-3 mb-8" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <span className="text-lg font-black">J</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">JiraFlow</span>
            </Link>

            <nav className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-800 pt-4 flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-semibold text-white">{user.name}</span>
                <span className="truncate text-xs text-slate-500">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-900 bg-slate-950 px-6 lg:bg-slate-950/30 lg:backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white capitalize">
              {pathname.split('/').pop() === 'dashboard' ? 'Overview' : pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
              {user.role} Space
            </span>
          </div>
        </header>

        {/* Page Content wrapper */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
