"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../utils/api";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await apiFetch("/auth/register-status");
        if (!data.isLocked) {
          router.push("/register");
        } else {
          setIsLocked(true);
          setLoading(false);
        }
      } catch (err) {
        // Fallback to showing portals if backend is offline or errors
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial glows */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="relative z-10 w-full max-w-3xl px-6 text-center space-y-12 animate-fade-in">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-4 animate-bounce duration-[2000ms]">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            TaskFlow
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Choose Your Portal
          </p>
        </div>

        {/* Portal choice buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
          {/* Admin Login link */}
          <Link
            href="/admin/login"
            className="group relative p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 backdrop-blur-md transition-all duration-300 text-left shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-5 font-bold transition group-hover:scale-105">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-purple-400 transition">
                Admin Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log in to coordinate projects, schedule tasks, invite new team members, and check system performance metrics.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition">
              Open Admin Portal <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Employee Login Link */}
          <Link
            href="/login"
            className="group relative p-6 rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 backdrop-blur-md transition-all duration-300 text-left shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5 font-bold transition group-hover:scale-105">
                👥
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition">
                Employee Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log in to check your active tasks, update sprint items, collaborate with project teams, and submit deliverables.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition">
              Open Employee Portal <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-600">
          &copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
