'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/shared/card';
import Badge from '@/components/shared/badge';
import { Settings, Shield, Bell, Key, Globe, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage system integrations, notification alerts, and space rules.</p>
      </div>

      {saved && (
        <div className="flex items-center space-x-2 rounded-lg bg-emerald-950/50 border border-emerald-500/50 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>System configurations saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Settings Form */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {isAdmin ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900/60 pb-2 text-indigo-400">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-bold text-white tracking-tight">Company Workspace Profile</h3>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace / Company Name</label>
                    <input
                      type="text"
                      defaultValue="JiraFlow Enterprise"
                      className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace Subdomain</label>
                      <input
                        type="text"
                        defaultValue="jiraflow-enterprise"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Primary Country Location</label>
                      <select
                        defaultValue="US"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900/60 pb-2 text-violet-400">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-bold text-white tracking-tight">Security & Governance</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span>Require two-factor auth (2FA) for Admin roles</span>
                        <span className="text-xs text-slate-500">Adds secondary authentication steps during logins.</span>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span>Cascade task deletion</span>
                        <span className="text-xs text-slate-500">Deleting a project space will automatically clean up all associated tasks.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-900/60 pb-2 text-indigo-400">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-bold text-white tracking-tight">Notification Channels</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span>Email alerts for assigned tasks</span>
                        <span className="text-xs text-slate-500">Receive an email when a project manager assigns a new task lane item.</span>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4 mt-0.5"
                      />
                      <div className="flex flex-col">
                        <span>In-app activity digest</span>
                        <span className="text-xs text-slate-500">Get a daily digest on recent comments and milestones.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-900/60">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </Card>

        {/* Mocks Side Column */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Key className="h-5 w-5" />
              <h4 className="font-bold text-white tracking-tight">Integrations Mock</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Link your workspace with external SaaS channels to push real-time task notifications automatically.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-950/50 border border-slate-900 p-3">
                <span className="text-xs text-slate-300 font-semibold">Slack Channel Link</span>
                <Badge variant="slate">Inactive</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-950/50 border border-slate-900 p-3">
                <span className="text-xs text-slate-300 font-semibold">GitHub Webhook Dispatch</span>
                <Badge variant="slate">Inactive</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
