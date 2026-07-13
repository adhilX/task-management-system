"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiFetch } from "../../../utils/api";
import { useUserAuthStore } from "../../../stores/userAuthStore";
import { useRouter } from "next/navigation";
import { User, Shield, Lock, Eye, EyeOff, Mail, Save } from "lucide-react";

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

export default function EmployeeProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userInfo, setAuth, logout } = useUserAuthStore();

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: userInfo?.name || "" },
  });

  // 1. Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["currentEmployeeProfile"],
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

  // Calculate Password Strength dynamically
  const newPasswordVal = passwordForm.watch("newPassword") || "";
  const hasLength = newPasswordVal.length >= 8;
  const hasUpper = /[A-Z]/.test(newPasswordVal);
  const hasNumber = /[0-9]/.test(newPasswordVal);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPasswordVal);

  const strengthScore = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthText = () => {
    if (!newPasswordVal) return "";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore <= 3) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return "text-red-500";
    if (strengthScore <= 3) return "text-amber-500";
    return "text-emerald-500";
  };

  // 2. Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (inputs: ProfileInputs) =>
      apiFetch(`/users/${userInfo?.id}`, {
        method: "PATCH",
        body: JSON.stringify(inputs),
      }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["currentEmployeeProfile"] });
      // Update store
      if (userInfo) {
        setAuth(useUserAuthStore.getState().accessToken || "", {
          ...userInfo,
          name: updatedUser.name,
        });
      }
      setProfileSuccess("Display name updated successfully.");
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

      // Logout and redirect to login
      setTimeout(() => {
        logout();
        router.push("/login?relogin=true");
      }, 2000);
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Failed to change password. Make sure current password is correct.");
      setTimeout(() => setPasswordError(""), 4000);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-title">Profile Settings</h1>
        <p className="text-xs text-text-muted mt-1">Manage your personal information and update your password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Detail Card */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-card">
              <div className="w-10 h-10 rounded-full bg-bg-accent border border-border-accent flex items-center justify-center text-brand-primary shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-title text-sm">Edit Profile</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Update your personal information.</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/25 rounded-xl text-xs text-[#10b981] font-semibold">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-semibold">
                {profileError}
              </div>
            )}

            <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-[11px] text-text-muted font-bold mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="relative flex items-center bg-bg-input/40 border border-border-input/60 rounded-xl px-3.5 py-2.5">
                  <Mail className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
                  <input
                    type="text"
                    disabled
                    value={userInfo?.email || ""}
                    className="w-full bg-transparent text-xs text-text-muted font-semibold focus:outline-none cursor-not-allowed"
                  />
                  <span className="bg-bg-accent border border-border-accent text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Read only
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-text-muted font-bold mb-1.5">
                  Display Name
                </label>
                <div className="relative flex items-center bg-bg-input border border-border-input focus-within:border-brand-primary rounded-xl px-3.5 py-2.5 transition-colors">
                  <User className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
                  <input
                    type="text"
                    {...profileForm.register("name")}
                    className="w-full bg-transparent text-xs text-text-title focus:outline-none"
                    placeholder="Display Name"
                  />
                </div>
                {profileForm.formState.errors.name && (
                  <p className="text-[10px] text-red-400 mt-1.5 font-bold">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary hover:bg-brand-primary/95 active:scale-[0.98] rounded-xl text-xs font-bold text-brand-btn-text shadow-lg shadow-indigo-500/10 transition duration-150 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-card">
              <div className="w-10 h-10 rounded-full bg-bg-accent border border-border-accent flex items-center justify-center text-brand-primary shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-title text-sm">Change Password</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Update your password to keep your account secure.</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/25 rounded-xl text-xs text-[#10b981] font-semibold">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-semibold">
                {passwordError}
              </div>
            )}

            <form onSubmit={passwordForm.handleSubmit((d) => changePasswordMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-[11px] text-text-muted font-bold mb-1.5">
                  Current Password
                </label>
                <div className="relative flex items-center bg-bg-input border border-border-input focus-within:border-brand-primary rounded-xl px-3.5 py-2.5 transition-colors">
                  <Lock className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                    className="w-full bg-transparent text-xs text-text-title focus:outline-none pr-8"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 text-text-muted hover:text-text-body focus:outline-none"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-[10px] text-red-400 mt-1.5 font-bold">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-text-muted font-bold mb-1.5">
                  New Password
                </label>
                <div className="relative flex items-center bg-bg-input border border-border-input focus-within:border-brand-primary rounded-xl px-3.5 py-2.5 transition-colors">
                  <Lock className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...passwordForm.register("newPassword")}
                    className="w-full bg-transparent text-xs text-text-title focus:outline-none pr-8"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 text-text-muted hover:text-text-body focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                <div className="flex items-center justify-between mt-2 w-full gap-2">
                  <div className="flex gap-1.5 flex-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strengthScore
                            ? strengthScore <= 1
                              ? "bg-red-500"
                              : strengthScore <= 3
                                ? "bg-amber-500"
                                : "bg-brand-primary"
                            : "bg-bg-accent"
                          }`}
                      />
                    ))}
                  </div>
                  {newPasswordVal && (
                    <span className={`text-[10px] font-bold ${getStrengthColor()} shrink-0`}>
                      {getStrengthText()}
                    </span>
                  )}
                </div>

                {passwordForm.formState.errors.newPassword && (
                  <p className="text-[10px] text-red-400 mt-1.5 font-bold">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-text-muted font-bold mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative flex items-center bg-bg-input border border-border-input focus-within:border-brand-primary rounded-xl px-3.5 py-2.5 transition-colors">
                  <Lock className="w-4 h-4 text-text-muted mr-2.5 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...passwordForm.register("confirmPassword")}
                    className="w-full bg-transparent text-xs text-text-title focus:outline-none pr-8"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-text-muted hover:text-text-body focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-1.5 font-bold">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements Checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-text-muted font-bold block">Password requirements:</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${hasLength ? "bg-[#10b981]/10 text-[#10b981]" : "bg-bg-accent text-text-muted"
                      }`}>
                      ✓
                    </span>
                    <span className={hasLength ? "text-[#10b981]" : "text-text-muted"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${hasNumber ? "bg-[#10b981]/10 text-[#10b981]" : "bg-bg-accent text-text-muted"
                      }`}>
                      ✓
                    </span>
                    <span className={hasNumber ? "text-[#10b981]" : "text-text-muted"}>One number</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${hasUpper ? "bg-[#10b981]/10 text-[#10b981]" : "bg-bg-accent text-text-muted"
                      }`}>
                      ✓
                    </span>
                    <span className={hasUpper ? "text-[#10b981]" : "text-text-muted"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${hasSpecial ? "bg-[#10b981]/10 text-[#10b981]" : "bg-bg-accent text-text-muted"
                      }`}>
                      ✓
                    </span>
                    <span className={hasSpecial ? "text-[#10b981]" : "text-text-muted"}>One special character</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary hover:bg-brand-primary/95 active:scale-[0.98] rounded-xl text-xs font-bold text-brand-btn-text shadow-lg shadow-indigo-500/10 transition duration-150 mt-6 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
