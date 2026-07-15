"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../../services/auth.service";
import { useAdminAuthStore } from "../../../../stores/adminAuthStore";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordInputs = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const router = useRouter();
  const { logout } = useAdminAuthStore();

  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (inputs: PasswordInputs) =>
      authService.changePassword({
        currentPassword: inputs.currentPassword,
        newPassword: inputs.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully! Logging out...");
      setPasswordSuccess("Password changed successfully! Logging out...");
      passwordForm.reset();

      // Logout after delay
      setTimeout(() => {
        logout();
        router.push("/admin/login?relogin=true");
      }, 2000);
    },
    onError: (err: any) => {
      const errMsg = err.message || "Failed to change password. Make sure current password is correct.";
      toast.error(errMsg);
      setPasswordError(errMsg);
      setTimeout(() => setPasswordError(""), 4000);
    },
  });

  return (
    <div className="max-w-2xl p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md space-y-6">
      <div>
        <h3 className="font-bold text-white tracking-tight text-lg">Change Password</h3>
        <p className="text-xs text-slate-400 mt-1">Update your sign-in password. Note: Changing password will log you out.</p>
      </div>

      {passwordSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-400">
          {passwordSuccess}
        </div>
      )}
      {passwordError && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400">
          {passwordError}
        </div>
      )}

      <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              {...passwordForm.register("currentPassword")}
              className="w-full px-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.currentPassword && (
            <p className="text-[10px] text-red-400 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...passwordForm.register("newPassword")}
              className="w-full px-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.newPassword && (
            <p className="text-[10px] text-red-400 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...passwordForm.register("confirmPassword")}
              className="w-full px-4 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-[10px] text-red-400 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg transition"
        >
          {changePasswordMutation.isPending ? "Updating Password..." : "Change Security Password"}
        </button>
      </form>
    </div>
  );
}
