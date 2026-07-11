'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import api from '@/lib/api';
import {
  UserSquare2,
  Lock,
  Mail,
  Building,
  User,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const profileSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  department: zod.string().min(1, 'Please specify a department'),
  password: zod.string().min(6, 'Password must be at least 6 characters').optional().or(zod.literal('')),
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
      password: '',
    },
  });

  if (!user) return null;

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        department: data.department,
      };
      if (data.password) {
        payload.password = data.password;
      }
      
      await api.put(`/users/${user.id}`, payload);
      await refreshUser();
      setSuccessMsg('Your profile has been updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Profile Workspace</h2>
        <p className="text-sm text-slate-400">View role credentials and modify your contact details.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Read-Only System Details Card */}
        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-xl space-y-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-300">
              <UserSquare2 className="h-10 w-10 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
              {user.role} Account
            </span>
          </div>

          <div className="space-y-4 border-t border-slate-900 pt-6 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>Account Status</span>
              </div>
              <span className="font-bold text-emerald-400">{user.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Building className="h-4 w-4 text-slate-500" />
                <span>Department</span>
              </div>
              <span className="font-bold text-white">{user.department || 'General'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Joined Workspace</span>
              </div>
              <span className="font-bold text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Update Profile Settings Form */}
        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-xl lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white">Profile Settings</h3>

          {successMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-emerald-950/50 border border-emerald-500/50 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>Full Name</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>Email Address</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="jane.doe@company.com"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-500" />
                  <span>Department</span>
                </label>
                <input
                  {...register('department')}
                  type="text"
                  placeholder="Engineering"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
                {errors.department && (
                  <p className="text-xs text-red-400">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Change Password</span>
                  </label>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Leave blank to keep current</span>
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-900">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Saving changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
