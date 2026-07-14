"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../services/auth.service";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().optional(),
});

type RegisterInputs = z.infer<typeof registerSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await authService.getRegistrationStatus();
        if (data.isLocked) {
          setIsLocked(true);
        }
      } catch (err) {
        // Assume unlocked if check fails so they can attempt setup
      } finally {
        setChecking(false);
      }
    }
    checkStatus();
  }, []);

  const onSubmit = async (data: RegisterInputs) => {
    setError("");
    setLoading(true);

    try {
      await authService.registerAdmin(data);

      // Admin created! Redirect to Admin Login
      router.push("/admin/login?setup=success");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center py-4">
        <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-slate-400 block mt-2">Checking system lock status...</span>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 rounded-full bg-red-500/10 text-red-400 items-center justify-center border border-red-500/20 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-white">Registration Disabled</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The initial administrator account has already been registered. For security reasons, public registration is locked.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg transition duration-150"
          >
            Go to Portals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Setup System Admin
        </span>
        <h1 className="text-xl font-bold text-white tracking-tight mt-3">
          Create Admin Account
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure the first master administrator for TaskFlow
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            {...register("name")}
            className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition duration-200"
            placeholder="System Administrator"
          />
          {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Admin Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition duration-200"
            placeholder="admin@company.com"
          />
          {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="block w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition duration-200"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/20 shadow-purple-600/10 transition duration-150"
        >
          {loading ? "Registering..." : "Create System Admin"}
        </button>
      </form>
    </div>
  );
}
