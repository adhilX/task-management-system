import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  splashTitle: string;
  splashDescription: string;
  extraSplashElement?: React.ReactNode;
}

export function AuthLayout({ children, splashTitle, splashDescription, extraSplashElement }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Left Column: Splash Screen (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-12 lg:flex border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="flex items-center space-x-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <span className="text-xl font-black tracking-tight">J</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">JiraFlow</span>
        </div>

        <div className="my-auto max-w-lg z-10 space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            {splashTitle}
          </h1>
          <p className="text-lg text-slate-400">
            {splashDescription}
          </p>
          {extraSplashElement}
        </div>

        <div className="z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} JiraFlow. Enterprise Software Group.
        </div>
      </div>

      {/* Right Column */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24 bg-slate-950">
        {children}
      </div>
    </div>
  );
}
