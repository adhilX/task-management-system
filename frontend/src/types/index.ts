export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Employee';
  status: 'Active' | 'Inactive';
  department?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  manager: User | string;
  team: (User | string)[];
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignee: User | string;
  project: Project | string;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees?: number;
  totalProjects?: number;
  totalTasks?: number;
  taskCompletion?: {
    completed: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  projectProgress?: {
    planning: number;
    active: number;
    completed: number;
    onHold: number;
  };
  recentActivities?: {
    id: string;
    title: string;
    projectName: string;
    assigneeName: string;
    status: string;
  }[];
  // Employee Stats
  assignedProjectsCount?: number;
  tasksOverview?: {
    pending: number;
    completed: number;
    total: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  priorityDistribution?: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingDeadlines?: {
    id: string;
    title: string;
    projectName: string;
    dueDate: string;
    priority: string;
  }[];
}
