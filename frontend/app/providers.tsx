"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-title)",
            border: "1px solid var(--border-card)",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "var(--brand-primary)",
              secondary: "var(--bg-card)",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "var(--bg-card)",
            },
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
}
