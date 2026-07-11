'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition focus:outline-none cursor-pointer"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/10">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{user.role}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-900 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-900">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account</p>
            <p className="text-sm font-semibold text-white truncate mt-1">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/dashboard/profile#settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span>Workspace Settings</span>
            </Link>
          </div>
          <div className="border-t border-slate-900 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
