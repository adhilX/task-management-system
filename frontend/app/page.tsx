"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../utils/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await apiFetch("/auth/register-status");
        if (!data.isLocked) {
          router.push("/register");
        } else {
          router.push("/login");
        }
      } catch (err) {
        // Fallback to login if backend is offline or errors
        router.push("/login");
      }
    }
    checkStatus();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold tracking-wide text-slate-400">Loading TaskFlow...</span>
      </div>
    </div>
  );
}

