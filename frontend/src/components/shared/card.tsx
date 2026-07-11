import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-900 bg-slate-900/25 p-6 backdrop-blur-xl transition-all duration-300 ${
        hoverable ? 'glass-panel-hover border-slate-900/40 hover:border-slate-800 shadow-lg shadow-black/30' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'red' | 'slate';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'indigo',
  className = '',
  ...props
}: StatsCardProps) {
  const glowColors = {
    indigo: 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20',
    violet: 'bg-violet-500/5 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/5 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/5 text-red-400 border-red-500/20',
    slate: 'bg-slate-500/5 text-slate-400 border-slate-500/20',
  };

  const textColors = {
    indigo: 'text-indigo-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    slate: 'text-slate-400',
  };

  return (
    <Card hoverable className={`relative overflow-hidden ${className}`} {...props}>
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full blur-xl opacity-20 bg-current ${textColors[color]}`}></div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2.5 text-3xl font-extrabold text-white tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${glowColors[color]}`}>
          <Icon className="h-5.5 w-5.5 shrink-0" />
        </div>
      </div>
      
      {(description || trend) && (
        <div className="mt-4 flex items-center space-x-1.5 text-xs text-slate-400">
          {trend && <span className={`${textColors[color]} font-semibold`}>{trend}</span>}
          {description && <span>{description}</span>}
        </div>
      )}
    </Card>
  );
}
