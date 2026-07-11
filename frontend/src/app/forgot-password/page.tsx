'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = zod.object({
  email: zod.string().email('Please enter a valid email address'),
});

type ForgotFormValues = zod.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Left Splash (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-12 lg:flex border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
        <div className="flex items-center space-x-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
            <span className="text-xl font-black tracking-tight">J</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">JiraFlow</span>
        </div>
        <div className="my-auto max-w-lg z-10 space-y-4">
          <h1 className="text-4xl font-extrabold text-white leading-tight">Password Recovery</h1>
          <p className="text-slate-400">
            Submit your registered email address and we'll dispatch instructions to reset your dashboard credentials.
          </p>
        </div>
        <div className="z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} JiraFlow. Enterprise Software Group.
        </div>
      </div>

      {/* Right Column Recovery Panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24 bg-slate-950">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Recover Password</h2>
            <p className="text-sm text-slate-400">
              Recover access to your Agile workspace.
            </p>
          </div>

          {isSubmitted ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Recovery Instructions Sent</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If that email matches an active account, we've dispatched a recovery link. Check your inbox shortly.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Work Email Address</label>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
