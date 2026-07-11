import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none"></div>
      
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 mb-6 shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse-slow">
        <HelpCircle className="h-10 w-10" />
      </div>

      <h1 className="text-8xl font-black tracking-tighter text-white bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent leading-none">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed">
        The workspace board or resource directory you are looking for has been moved, renamed, or is restricted.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all duration-200 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
