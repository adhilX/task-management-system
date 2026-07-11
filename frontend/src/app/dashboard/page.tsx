'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { AlertCircle } from 'lucide-react';
import { AdminDashboard } from '@/features/dashboard/components/admin-dashboard';
import { EmployeeDashboard } from '@/features/dashboard/components/employee-dashboard';
import { CardSkeleton } from '@/components/common/loading-skeleton';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats', user?.role],
    queryFn: async () => {
      if (user?.role === 'Admin') {
        return dashboardService.getAdminStats();
      } else {
        return dashboardService.getEmployeeStats();
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-800/60 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 bg-slate-900/20 border border-slate-900 rounded-xl"></div>
          <div className="h-80 bg-slate-900/20 border border-slate-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-red-950/30 bg-red-950/10 p-8 text-center max-w-xl mx-auto">
        <div className="flex flex-col items-center space-y-3 text-red-400">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-white">Failed to Load Dashboard</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            There was an issue fetching system analytics. Please verify your internet connection or backend services.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'Admin';

  if (isAdmin) {
    return <AdminDashboard stats={stats} />;
  }

  return <EmployeeDashboard stats={stats} currentUser={user} />;
}
