"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../services/auth.service";
import { userService } from "../../../services/user.service";
import { useUserAuthStore } from "../../../stores/userAuthStore";
import { User, Mail, Save } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileInputs = z.infer<typeof profileSchema>;

export default function EmployeeProfilePage() {
  const queryClient = useQueryClient();
  const { userInfo, setAuth } = useUserAuthStore();

  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const profileForm = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: userInfo?.name || "" },
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ["currentEmployeeProfile"],
    queryFn: () => authService.getCurrentUser(),
  });

  React.useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name });
    }
  }, [profile, profileForm]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (inputs: ProfileInputs) =>
      userService.updateUser(userInfo?.id || "", inputs),
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-title">Profile</h1>
        <p className="text-xs text-text-muted mt-1">Manage your personal profile information.</p>
      </div>

      <div className="p-6 rounded-2xl bg-bg-card border border-border-card backdrop-blur-md">
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
    </div>
  );
}
