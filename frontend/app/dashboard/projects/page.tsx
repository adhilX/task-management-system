"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";

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
      <div className="text-center py-10 text-xs text-slate-400">Loading your assigned projects...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">My Projects</h1>
        <p className="text-xs text-slate-400 mt-1">Projects you are actively assigned to coordinate or deliver.</p>
      </div>

      {!data || !data.projects || data.projects.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-500 border border-slate-850 rounded-2xl">
          You are not currently assigned to any active projects.
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
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white tracking-tight text-base">{proj.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      proj.status === "active"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : proj.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-800"
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-455 leading-relaxed min-h-[40px]">
                    {proj.description || "No project description provided."}
                  </p>

                  <div className="text-[11px] space-y-1.5 pt-3 border-t border-slate-800/60">
                    <p className="text-slate-450">
                      <span className="font-semibold text-slate-300">Manager:</span> {managerName}
                    </p>
                    <p className="text-slate-450">
                      <span className="font-semibold text-slate-300">Team:</span> {teamNames || "Unassigned"}
                    </p>
                    {proj.startDate && (
                      <p className="text-slate-500 text-[10px]">
                        Start: {new Date(proj.startDate).toLocaleDateString()} &bull; End:{" "}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "N/A"}
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
