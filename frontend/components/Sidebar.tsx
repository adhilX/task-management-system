"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserAuthStore } from "../stores/userAuthStore";
import { LayoutDashboard, Folder, ClipboardList, User, Settings, LogOut, X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface SidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onCloseMobile, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo, logout } = useUserAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "My Projects", path: "/dashboard/projects", icon: <Folder className="w-4 h-4" /> },
    { name: "My Tasks", path: "/dashboard/tasks", icon: <ClipboardList className="w-4 h-4" /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
    { name: "Settings", path: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  if (isMobile) {
    return (
      <div className="w-64 bg-bg-card border-r border-border-card flex flex-col p-6 animate-slide-in h-full">
        <div className="flex items-center justify-between mb-8">
          <span className="font-bold text-text-title">Menu</span>
          <button onClick={onCloseMobile} className="text-text-muted hover:text-text-title">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 py-2.5 px-4 text-sm font-medium rounded-xl transition duration-150 ${
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-text-muted hover:text-text-title hover:bg-bg-accent"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:text-white hover:bg-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Sign Out"
          message="Are you sure you want to log out of your session? You will need to enter your password again to return."
          confirmText="Sign Out"
          cancelText="Stay logged in"
          variant="danger"
        />
      </div>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-full border-r border-border-card bg-bg-card shrink-0">
      {/* Branding */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border-card">
        <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <span className="text-brand-btn-text font-extrabold text-xs tracking-wider">TS</span>
        </div>
        <div>
          <span className="font-bold text-text-title tracking-wide text-sm block">TaskSphere</span>
          <span className="text-[9px] text-brand-primary font-semibold uppercase tracking-wider block -mt-1">
            Employee Portal
          </span>
        </div>
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 ${
                isActive
                  ? "bg-bg-accent text-brand-primary border border-border-accent shadow-inner"
                  : "text-text-muted hover:bg-bg-accent/40 hover:text-text-title"
              }`}
            >
              <span className={`transition-colors ${isActive ? "text-brand-primary" : "text-text-muted"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-border-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-bg-accent border border-border-accent flex items-center justify-center font-bold text-brand-primary text-sm shadow-md">
            {userInfo?.name?.substring(0, 2).toUpperCase() || "EM"}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-text-title truncate">{userInfo?.name || "Employee"}</p>
            <p className="text-[10px] text-text-muted font-medium truncate mt-0.5">{userInfo?.email || "employee@company.com"}</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-xs font-bold text-text-body hover:text-text-title bg-bg-input/60 border border-border-input hover:bg-bg-accent transition duration-150 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse block shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <span className="flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5 text-text-muted group-hover:text-red-400 transition-colors" />
              <span>Sign Out</span>
            </span>
          </div>
        </button>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to log out of your session? You will need to enter your password again to return."
        confirmText="Sign Out"
        cancelText="Stay logged in"
        variant="danger"
      />
    </aside>
  );
}
