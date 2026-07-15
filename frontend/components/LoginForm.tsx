"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAdminAuthStore } from "@/stores/adminAuthStore";
import { useUserAuthStore } from "@/stores/userAuthStore";

import { toast } from "react-hot-toast";

interface LoginFormProps {
  portal: "admin" | "employee";
}

export default function LoginForm({ portal }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const adminStore = useAdminAuthStore();
  const userStore = useUserAuthStore();

  const store = portal === "admin" ? adminStore : userStore;
  const { setAuth, isAuthenticated } = store;

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push(portal === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router, portal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (portal === "admin") {
        data = await authService.adminLogin({ email, password });
      } else {
        data = await authService.login({ email, password, portal: "employee" });
      }

      setAuth(data.accessToken, data.user);
      toast.success("Welcome back! Logged in successfully.");
      router.push(portal === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      const errMsg = err.message || `Invalid ${portal === "admin" ? "administrator" : "employee"} credentials. Please try again.`;
      setError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

  // Portal-specific theme configurations
  const isAdmin = portal === "admin";
  const badgeStyle = isAdmin
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    : "bg-bg-accent text-brand-primary border border-border-accent";
  const portalLabel = isAdmin ? "Admin Portal" : "Employee Portal";
  const portalDesc = isAdmin
    ? "Manage system tasks, employees, and reports"
    : "Access your tasks and track your work";
  const inputRing = isAdmin
    ? "focus:ring-emerald-500/20 focus:border-emerald-500"
    : "focus:ring-brand-primary/20 focus:border-brand-primary";
  const btnBg = isAdmin
    ? "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-600/20 shadow-emerald-600/10 text-pure-white"
    : "bg-brand-primary hover:bg-brand-primary/95 text-brand-btn-text active:scale-[0.98]";
  const linkText = isAdmin
    ? "text-emerald-400 hover:text-emerald-300"
    : "text-brand-primary hover:underline";
  const spinnerColor = isAdmin
    ? "text-pure-white"
    : "text-brand-btn-text";
  
  return (
    <div>
      <div className="text-center mb-6">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeStyle}`}>
          {portalLabel}
        </span>
        <h1 className="text-xl font-bold text-text-title tracking-tight mt-3">
          Sign In
        </h1>
        <p className="text-xs text-text-muted mt-1">
          {portalDesc}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm text-text-title placeholder-text-muted focus:outline-none focus:ring-2 transition duration-200 ${inputRing}`}
              placeholder={isAdmin ? "admin@company.com" : "name@company.com"}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Password
            </label>
            {!isAdmin && (
              <Link
                href="/forgot-password"
                className={`text-xs font-medium transition duration-150 ${linkText}`}
              >
                Forgot?
              </Link>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full pl-10 pr-10 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm text-text-title placeholder-text-muted focus:outline-none focus:ring-2 transition duration-200 ${inputRing}`}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 ${btnBg} ${
            loading ? "opacity-75 cursor-not-allowed shadow-none" : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className={`animate-spin h-4 w-4 ${spinnerColor}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            `Sign In to ${portalLabel}`
          )}
        </button>
      </form>

      {isAdmin && (
        <div className="mt-6 pt-6 border-t border-border-input text-center">
          <p className="text-xs text-text-muted">
            Are you looking for employee tasks?{" "}
            <Link
              href="/login"
              className={`font-semibold transition duration-150 ${linkText}`}
            >
              Access Employee Portal
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
