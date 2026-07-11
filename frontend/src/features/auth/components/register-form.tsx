'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { UserPlus, AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

const registerSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: signup } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signup(data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      if (err.message && (err.message.includes('lock') || err.message.includes('Admin') || err.message.includes('registered'))) {
        setIsLocked(true);
      } else {
        setErrorMsg(err.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-500/50 p-6 text-sm text-emerald-400 text-center">
          <strong className="block text-base mb-1">Workspace initialized successfully!</strong> 
          Redirecting to sign in screen shortly...
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="flex flex-col space-y-4 rounded-lg bg-amber-950/40 border border-amber-500/40 p-6 text-sm text-amber-300">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
            <span className="font-bold text-white text-base">Registration Locked</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The initial Administrator account has already been registered. For security reasons, public registration is deactivated.
          </p>
          <p className="text-slate-400 text-xs">
            Please contact your team administrator to request your employee credential profile.
          </p>
          <Link href="/login" className="text-center font-bold text-indigo-400 hover:text-indigo-300 pt-2 underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Bootstrap Workspace</h2>
        <p className="text-sm text-slate-400">
          Initialize the platform with your company's master Admin.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Full Name</label>
          <input
            {...register('name')}
            type="text"
            placeholder="Jane Doe"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-900"
          />
          {errors.name && (
            <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Work Email Address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="admin@company.com"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:bg-slate-900"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
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
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Register Administrator</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-400">Already initialized? </span>
        <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
