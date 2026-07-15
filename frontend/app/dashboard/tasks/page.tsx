"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../../services/task.service";
import { ClipboardList } from "lucide-react";
import { toast } from "react-hot-toast";

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
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  // Mutation to update task status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      taskService.updateTask(id, { status }),
    onSuccess: (_, variables) => {
      toast.success(`Task status updated to "${variables.status}"`);
      queryClient.invalidateQueries({ queryKey: ["employeeTasks"] });
      queryClient.invalidateQueries({ queryKey: ["employeeStats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update task status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin" />
        </div>
        <span className="text-brand-primary font-semibold text-xs animate-pulse">Loading your tasks board...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text-title">My Tasks</h1>
        <p className="text-xs text-text-muted mt-1">Sprint items assigned to you. Click status selectors to update progress.</p>
      </div>

      {!tasksData || !tasksData.tasks || tasksData.tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-border-card rounded-2xl bg-bg-card/50 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-bg-accent border border-border-accent flex items-center justify-center text-brand-primary shadow-inner">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-text-title text-xs">No Tasks Found</h4>
            <p className="text-[10px] text-text-muted max-w-[240px]">You do not have any tasks currently assigned to you.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-card rounded-2xl bg-bg-card/40 backdrop-blur-md">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-card text-text-muted font-bold uppercase bg-bg-card">
                <th className="py-3.5 px-6">Task ID</th>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Project</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="text-text-body">
              {tasksData.tasks.map((task) => {
                const projName = typeof task.project === "object" ? task.project.name : "N/A";
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

                return (
                  <tr key={task.id} className="border-b border-border-card/50 hover:bg-bg-accent/30 transition duration-150">
                    <td className="py-4 px-6 font-mono text-[10px] text-text-muted">{task.id?.substring(18)}</td>
                    <td className="py-4 px-6 font-bold text-text-title max-w-[200px] truncate">
                      {task.title}
                      {task.description && (
                        <span className="block text-[10px] font-medium text-text-muted truncate mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-text-body font-semibold">{projName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${task.priority === "high"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority === "medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-bg-accent text-text-muted border-border-card"
                        }`}>
                      {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={isOverdue ? "text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg" : "text-text-body font-semibold"}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold capitalize ${
                        task.status?.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : task.status?.toLowerCase() === "in progress" || task.status?.toLowerCase() === "in-progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : task.status?.toLowerCase() === "review"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-bg-accent text-text-muted border border-border-accent"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-block text-left">
                        <select
                          value={task.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: task.id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                          className="appearance-none bg-bg-input border border-border-input hover:border-border-accent rounded-xl text-text-title text-xs py-1.5 pl-3 pr-8 focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="To Do">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">In Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[8px] font-bold">▼</span>
                      </div>
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
