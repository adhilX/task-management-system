"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiFetch } from "../../../../utils/api";
import { useAdminAuthStore } from "../../../../stores/adminAuthStore";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileInputs = z.infer<typeof profileSchema>;
type PasswordInputs = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { adminInfo, setAuth, logout } = useAdminAuthStore();

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const profileForm = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: adminInfo?.name || "" },
  });

  // 1. Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["currentAdminProfile"],
    queryFn: () => apiFetch("/auth/me"),
  });

  React.useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name });
    }
  }, [profile, profileForm]);

  const passwordForm = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // 2. Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (inputs: ProfileInputs) =>
      apiFetch(`/users/${adminInfo?.id}`, {
        method: "PATCH",
        body: JSON.stringify(inputs),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["currentAdminProfile"] });
      // Update store
      if (adminInfo) {
        setAuth(useAdminAuthStore.getState().accessToken || "", {
          ...adminInfo,
          name: updatedUser.name,
        });
      }
      setProfileSuccess("Profile name updated successfully.");
      setTimeout(() => setProfileSuccess(""), 4000);
    },
    onError: (err: any) => {
      setProfileError(err.message || "Failed to update profile name.");
      setTimeout(() => setProfileError(""), 4000);
    },
  });

  // 3. Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: (inputs: PasswordInputs) =>
      apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: inputs.currentPassword,
          newPassword: inputs.newPassword,
        }),
      }),
    onSuccess: () => {
      setPasswordSuccess("Password changed successfully! Logging out...");
      passwordForm.reset();
      
      // Logout after delay
      setTimeout(() => {
        logout();
        router.push("/admin/login?relogin=true");
      }, 2000);
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Failed to change password. Make sure current password is correct.");
      setTimeout(() => setPasswordError(""), 4000);
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profile Detail Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md space-y-6">
        <div>
          <h3 className="font-bold text-white tracking-tight text-lg">Admin Profile Details</h3>
          <p className="text-xs text-slate-400 mt-1">View and edit your personal system credentials.</p>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-400">
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400">
            {profileError}
          </div>
        )}

        <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="text"
              disabled
              value={adminInfo?.email || ""}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Display Name
            </label>
            <input
              type="text"
              {...profileForm.register("name")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="Name"
            />
            {profileForm.formState.errors.name && (
              <p className="text-[10px] text-red-400 mt-1">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg transition"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Display Name"}
          </button>
        </form>
      </div>

      {/* Password Change Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md space-y-6">
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
            <input
              type="password"
              {...passwordForm.register("currentPassword")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-[10px] text-red-400 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              New Password
            </label>
            <input
              type="password"
              {...passwordForm.register("newPassword")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-[10px] text-red-400 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              {...passwordForm.register("confirmPassword")}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              placeholder="••••••••"
            />
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
    </div>
  );
}
