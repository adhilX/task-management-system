'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { LogIn, AlertCircle } from 'lucide-react';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Agile Project Management, Redefined.
          </h1>
          <p className="text-lg text-slate-400">
            Streamline your software workflows, monitor project progression in real-time, and manage team assignments within a unified ecosystem.
          </p>
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
        </div>

        <div className="z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} JiraFlow. Enterprise Software Group.
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24 bg-slate-950">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h2>
            <p className="text-sm text-slate-400">
              Welcome back! Access your project spaces and boards.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-900"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Forgot password?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-900"
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-slate-400">First time here? </span>
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Create Admin Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
