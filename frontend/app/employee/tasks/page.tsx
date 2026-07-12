"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../utils/api";

interface Member {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: string | Project;
  assignee: string | Member;
  dueDate?: string;
}

export default function EmployeeTasksPage() {
  const queryClient = useQueryClient();

  // Fetch tasks assigned to employee (filtered automatically by backend JWT)
  const { data: tasksData, isLoading } = useQuery<{ tasks: Task[] }>({
    queryKey: ["employeeTasks"],
    queryFn: () => apiFetch("/tasks", { params: { limit: 100 } }),
  });

  // Mutation to update task status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
      queryClient.invalidateQueries({ queryKey: ["employeeStats"] });
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-10 text-xs text-slate-400">Loading your tasks board...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">My Tasks</h1>
        <p className="text-xs text-slate-400 mt-1">Sprint items assigned to you. Click status selectors to update progress.</p>
      </div>

      {!tasksData || !tasksData.tasks || tasksData.tasks.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-500 border border-slate-850 rounded-2xl">
          You do not have any tasks assigned to you.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-900/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-900/30">
                <th className="py-3 px-6">Task ID</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Project</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {tasksData.tasks.map((task) => {
                const projName = typeof task.project === "object" ? task.project.name : "N/A";
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

                return (
                  <tr key={task.id} className="border-b border-slate-800/40 hover:bg-slate-900/10 transition">
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500">{task.id?.substring(18)}</td>
                    <td className="py-4 px-6 font-semibold text-white max-w-[200px] truncate">
                      {task.title}
                      {task.description && (
                        <span className="block text-[10px] font-normal text-slate-500 truncate mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400">{projName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        task.priority === "high"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority === "medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-800"
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={isOverdue ? "text-red-400 font-bold" : "text-slate-400"}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold capitalize ${
                        task.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : task.status === "in-progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : task.status === "review"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-slate-900 text-slate-400"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: task.id, status: e.target.value })}
                        disabled={updateStatusMutation.isPending}
                        className="px-2 py-1.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
