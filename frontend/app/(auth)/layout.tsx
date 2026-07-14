import React from "react";
import ThemeToggle from "../../components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-bg-dashboard text-text-body font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background radial glow effects */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Interactive grid background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-card)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-card)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" 
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo / Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-text-title">
            TaskSphere
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Enterprise Task Management
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="bg-bg-card/75 backdrop-blur-xl border border-border-card rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/10">
          {children}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} TaskSphere Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
