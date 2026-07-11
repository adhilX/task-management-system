import React from 'react';

type BadgeVariant = 
  | 'default' 
  | 'indigo' 
  | 'violet' 
  | 'emerald' 
  | 'amber' 
  | 'red' 
  | 'slate';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  glow?: boolean;
}

export default function Badge({ 
  children, 
  variant = 'default', 
  glow = false, 
  className = '', 
  ...props 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all duration-150';
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-800/40 text-slate-300 border-slate-700/50',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    red: 'bg-red-500/10 text-red-400 border-red-500/25',
  };

  const glowStyles = glow ? {
    indigo: 'shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    violet: 'shadow-[0_0_10px_rgba(139,92,246,0.15)]',
    emerald: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    amber: 'shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    red: 'shadow-[0_0_10px_rgba(239,68,68,0.15)]',
    default: '',
    slate: '',
  }[variant] : '';

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${glowStyles} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}
