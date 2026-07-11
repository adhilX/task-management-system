'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      splashTitle="System Initialization"
      splashDescription="Create the primary administrator account to bootstrap your company's JiraFlow workspace."
      extraSplashElement={
        <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 p-4 text-sm text-indigo-300">
          <strong>Security Notice:</strong> Subsequent registration calls are automatically locked once the initial administrator is created. All additional employee profiles must be generated within the Admin Console.
        </div>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
