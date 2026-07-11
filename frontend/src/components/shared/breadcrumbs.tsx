'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/dashboard') return null;

  const paths = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium text-slate-500">
      <Link href="/dashboard" className="flex items-center hover:text-indigo-400 transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {paths.map((path, index) => {
        const isDashboard = path.toLowerCase() === 'dashboard';
        if (isDashboard) return null;

        const routeTo = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        const displayName = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" />
            {isLast ? (
              <span className="text-slate-200 font-semibold truncate max-w-[120px] sm:max-w-none">{displayName}</span>
            ) : (
              <Link href={routeTo} className="hover:text-indigo-400 transition-colors truncate max-w-[120px] sm:max-w-none">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
