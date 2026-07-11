'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <AuthLayout
      splashTitle="Agile Project Management, Redefined."
      splashDescription="Streamline your software workflows, monitor project progression in real-time, and manage team assignments within a unified ecosystem."
      extraSplashElement={
        <div className="flex items-center space-x-6 pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">99.9%</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Uptime</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">10x</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Team Speed</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
