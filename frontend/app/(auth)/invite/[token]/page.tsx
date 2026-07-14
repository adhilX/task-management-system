"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../../services/auth.service";

const activateSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ActivateInputs = z.infer<typeof activateSchema>;

export default function InviteActivationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateInputs>({
    resolver: zodResolver(activateSchema),
  });

  useEffect(() => {
    async function verifyToken() {
      try {
        const data = await authService.verifyInvite(token);
        setUserInfo(data);
      } catch (err: any) {
        setError(err.message || "Invitation link is invalid or has expired.");
      } finally {
        setChecking(false);
      }
    }
    verifyToken();
  }, [token]);

  const onSubmit = async (data: ActivateInputs) => {
    setError("");
    setLoading(true);

    try {
      await authService.activateInvite({
        token,
        password: data.password,
      });

      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push("/login?activated=true");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Activation failed. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center py-4">
        <svg className="animate-spin h-6 w-6 text-indigo-500 dark:text-white mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-text-muted block mt-2">Verifying invitation token...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 rounded-full bg-red-500/10 text-red-400 items-center justify-center border border-red-500/20 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-text-title">Invitation Invalid</h1>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          {error}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-pure-white hover:bg-slate-800 transition duration-150"
          >
            Go to Portals
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-3">
        <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 items-center justify-center border border-emerald-500/20 mb-2 animate-bounce">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-text-title">Account Activated!</h1>
        <p className="text-xs text-text-muted">
          Your password has been successfully configured. Redirecting to employee portal...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 dark:bg-white/10 dark:text-white dark:border-white/20">
          Welcome to TaskFlow
        </span>
        <h1 className="text-xl font-bold text-text-title tracking-tight mt-3">
          Activate Your Account
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Hello <strong className="text-text-title">{userInfo?.name}</strong>. Choose a password to initialize your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email read only */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="text"
            disabled
            value={userInfo?.email}
            className="block w-full px-4 py-2.5 bg-bg-input/60 border border-border-input rounded-xl text-sm text-text-muted cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
            Create Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="block w-full pl-4 pr-10 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm text-text-title placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-white/20 dark:focus:border-white transition duration-200"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-title focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="block w-full pl-4 pr-10 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm text-text-title placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-white/20 dark:focus:border-white transition duration-200"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-title focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-pure-white dark:text-slate-950 shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/20 shadow-indigo-600/10 dark:bg-white dark:hover:bg-slate-100 dark:hover:shadow-white/20 dark:shadow-white/10 transition duration-150"
        >
          {loading ? "Activating..." : "Activate Account & Login"}
        </button>
      </form>
    </div>
  );
}
