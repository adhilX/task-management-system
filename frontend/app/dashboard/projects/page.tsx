"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";
import { Folder } from "lucide-react";

interface Member {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  manager: string | Member;
  team: Array<string | Member>;
}

export default function EmployeeProjectsPage() {
  // Fetch assigned projects only (handled securely by backend based on JWT)
  const { data, isLoading } = useQuery<{ projects: Project[] }>({
    queryKey: ["employeeProjects"],
    queryFn: () => apiFetch("/projects"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin" />
        </div>
        <span className="text-brand-primary font-semibold text-xs animate-pulse">Loading assigned projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-title">My Projects</h1>
        <p className="text-xs text-text-muted mt-1">Projects you are actively assigned to coordinate or deliver.</p>
      </div>

      {!data || !data.projects || data.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-border-card rounded-2xl bg-bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-bg-accent border border-border-accent flex items-center justify-center text-brand-primary shadow-inner">
            <Folder className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-text-title text-xs">No Projects Assigned</h4>
            <p className="text-[10px] text-text-muted max-w-[240px]">You are not currently assigned to any active projects.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((proj) => {
            const managerName = typeof proj.manager === "object" ? proj.manager.name : "System Admin";
            const teamNames = proj.team
              .map((member) => (typeof member === "object" ? member.name : member))
              .join(", ");

            return (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-bg-card border border-border-card hover:border-border-accent transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-text-title tracking-tight text-sm group-hover:text-brand-primary transition-colors">{proj.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border capitalize shrink-0 ${proj.status === "active"
                        ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                        : proj.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-bg-accent text-text-muted border-border-card"
                      }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-body leading-relaxed min-h-[40px]">
                    {proj.description || "No project description provided."}
                  </p>

                  <div className="text-[11px] space-y-1.5 pt-3 border-t border-border-card/80">
                    <p className="text-text-body">
                      <span className="font-bold text-text-title">Manager:</span> {managerName}
                    </p>
                    <p className="text-text-body">
                      <span className="font-bold text-text-title">Team:</span> {teamNames || "Unassigned"}
                    </p>
                    {proj.startDate && (
                      <p className="text-text-muted text-[10px] font-semibold pt-1">
                        Start: {new Date(proj.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} &bull; End:{" "}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
