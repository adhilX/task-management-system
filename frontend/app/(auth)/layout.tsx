import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow effects */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Interactive grid background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" 
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
            <svg
              className="w-6 h-6 text-white"
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
          <h2 className="text-2xl font-bold tracking-tight text-white">
            TaskSphere
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Task Management
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {children}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} TaskSphere Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
