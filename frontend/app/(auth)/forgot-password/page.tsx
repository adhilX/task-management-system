"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-text-title tracking-tight">
          Forgot Password
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Enter your email to receive recovery instructions
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 items-center justify-center border border-emerald-500/20 mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-text-title">
            We have sent a password reset link to <strong className="text-text-title">{email}</strong>.
          </p>
          <p className="text-xs text-text-muted">
            Please check your spam or promotions folder if you don't receive it in a few minutes.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-block py-2.5 px-6 rounded-xl bg-bg-input border border-border-input text-xs font-semibold text-text-title hover:bg-bg-card transition duration-150"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

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
                className="block w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm text-text-title placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition duration-200"
                placeholder="name@company.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 ${
              loading
                ? "bg-brand-primary/50 text-brand-btn-text/50 cursor-not-allowed shadow-none"
                : "bg-brand-primary text-brand-btn-text hover:bg-brand-primary/90"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="mt-6 pt-6 border-t border-border-input text-center text-xs font-semibold">
            <Link
              href="/login"
              className="text-brand-primary hover:underline transition duration-150"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
