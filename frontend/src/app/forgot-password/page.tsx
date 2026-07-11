'use client';

import React from 'react';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      splashTitle="Password Recovery"
      splashDescription="Submit your registered email address and we'll dispatch instructions to reset your dashboard credentials."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
