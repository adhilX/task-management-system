"use client";

import React from "react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md space-y-6">
      <div>
        <h3 className="font-bold text-white tracking-tight text-lg">System Settings</h3>
        <p className="text-xs text-slate-400 mt-1">Configure global server parameters, JWT timeouts, and SMTP notification values.</p>
      </div>

      <div className="space-y-4">
        {/* Registration lock */}
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Public Registrations</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Disables registrations after the first admin setup.</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            🔒 LOCKED
          </span>
        </div>

        {/* JWT configurations */}
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
          <h4 className="text-xs font-semibold text-white">Token Lifecycles</h4>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className="text-slate-500 block">Access Token Expiry:</span>
              <span className="font-mono text-white block mt-0.5">15 minutes (Standard)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Refresh Token Expiry:</span>
              <span className="font-mono text-white block mt-0.5">7 days</span>
            </div>
          </div>
        </div>

        {/* SMTP configurations */}
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
          <h4 className="text-xs font-semibold text-white">SMTP Notifications</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
              <span className="text-slate-550">SMTP Host:</span>
              <span className="font-mono text-slate-300">{process.env.SMTP_HOST || "Local Mock/Printed to Logs"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900/50 pb-1.5">
              <span className="text-slate-550">SMTP Port:</span>
              <span className="font-mono text-slate-300">{process.env.SMTP_PORT || "587"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550">SMTP Sender:</span>
              <span className="font-mono text-slate-300">{process.env.SMTP_FROM || '"TaskFlow" <no-reply@taskflow.com>'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
