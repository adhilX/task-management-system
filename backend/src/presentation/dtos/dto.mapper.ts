import { User } from '../../domain/entities/user.entity';
import { Project } from '../../domain/entities/project.entity';
import { Task } from '../../domain/entities/task.entity';

export interface RecentActivityDto {
  id: string;
  title: string;
  type: string;
  status: string;
  updatedAt?: string | Date;
  assigneeName: string;
  projectName: string;
}

export interface UpcomingDeadlineDto {
  id: string;
  title: string;
  dueDate?: string | Date;
  priority: string;
  projectName: string;
}

export interface AdminStatsDto {
  totalEmployees: number;
  totalProjects: number;
  totalTasks: number;
  taskCompletion: {
    completed: number;
    pending: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  projectProgress: {
    planning: number;
    active: number;
    completed: number;
    onHold: number;
  };
  recentActivities: RecentActivityDto[];
}

export interface EmployeeStatsDto {
  assignedProjectsCount: number;
  tasksOverview: {
    total: number;
    completed: number;
    pending: number;
    breakdown: {
      todo: number;
      inProgress: number;
      review: number;
      completed: number;
    };
  };
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  upcomingDeadlines: UpcomingDeadlineDto[];
  recentActivities: RecentActivityDto[];
}

export interface LoginResponseDto {
  user: UserDto;
  accessToken: string;
}

export interface RefreshResponseDto {
  accessToken: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  status: string;
  manager: string | UserDto;
  team: (string | UserDto)[];
  startDate?: string | Date;
  endDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  progress?: number;
  totalTasks?: number;
  completedTasks?: number;
}

export interface TaskDto {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project: string | ProjectDto;
  assignee: string | UserDto;
  dueDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export class DtoMapper {
  static toUser(user: Partial<User> | null | undefined): UserDto {
    if (!user) {
      return null as unknown as UserDto;
    }
    const temp = user as { _id?: { toString(): string } };
    return {
      id: user.id || temp._id?.toString() || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || '',
      department: user.department || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toUserList(users: Partial<User>[] | null | undefined): UserDto[] {
    if (!users) {
      return [];
    }
    return users.map(user => this.toUser(user));
  }

  static toProject(project: Partial<Project> | null | undefined): ProjectDto {
    if (!project) {
      return null as unknown as ProjectDto;
    }
    
    let managerDto: string | UserDto = '';
    if (project.manager) {
      if (typeof project.manager === 'object') {
        managerDto = this.toUser(project.manager);
      } else {
        managerDto = project.manager;
      }
    }

    const teamDto: (string | UserDto)[] = [];
    if (project.team) {
      for (const member of project.team) {
        if (typeof member === 'object') {
          teamDto.push(this.toUser(member));
        } else {
          teamDto.push(member);
        }
      }
    }

    const temp = project as { _id?: { toString(): string } };
    return {
      id: project.id || temp._id?.toString() || '',
      name: project.name || '',
      description: project.description || '',
      status: project.status || '',
      manager: managerDto,
      team: teamDto,
      startDate: project.startDate,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      progress: (project as any).progress || 0,
      totalTasks: (project as any).totalTasks || 0,
      completedTasks: (project as any).completedTasks || 0,
    };
  }

  static toProjectList(projects: Partial<Project>[] | null | undefined): ProjectDto[] {
    if (!projects) {
      return [];
    }
    return projects.map(project => this.toProject(project));
  }

  static toTask(task: Partial<Task> | null | undefined): TaskDto {
    if (!task) {
      return null as unknown as TaskDto;
    }

    let projectDto: string | ProjectDto = '';
    if (task.project) {
      if (typeof task.project === 'object') {
        projectDto = this.toProject(task.project);
      } else {
        projectDto = task.project;
      }
    }

    let assigneeDto: string | UserDto = '';
    if (task.assignee) {
      if (typeof task.assignee === 'object') {
        assigneeDto = this.toUser(task.assignee);
      } else {
        assigneeDto = task.assignee;
      }
    }

    const temp = task as { _id?: { toString(): string } };
    return {
      id: task.id || temp._id?.toString() || '',
      title: task.title || '',
      description: task.description || '',
      status: task.status || '',
      priority: task.priority || '',
      project: projectDto,
      assignee: assigneeDto,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  static toTaskList(tasks: Partial<Task>[] | null | undefined): TaskDto[] {
    if (!tasks) {
      return [];
    }
    return tasks.map(task => this.toTask(task));
  }

  static toRecentActivity(task: Partial<Task> | null | undefined): RecentActivityDto {
    if (!task) {
      return null as unknown as RecentActivityDto;
    }
    const assigneeName = task.assignee && typeof task.assignee === 'object'
      ? (task.assignee as any).name || ''
      : 'Unassigned';
    const projectName = task.project && typeof task.project === 'object'
      ? (task.project as any).name || ''
      : 'N/A';
    const temp = task as { _id?: { toString(): string } };
    return {
      id: task.id || temp._id?.toString() || '',
      title: task.title || '',
      type: 'task',
      status: task.status || '',
      updatedAt: task.updatedAt,
      assigneeName,
      projectName,
    };
  }

  static toRecentActivityList(tasks: Partial<Task>[] | null | undefined): RecentActivityDto[] {
    if (!tasks) {
      return [];
    }
    return tasks.map(task => this.toRecentActivity(task));
  }

  static toUpcomingDeadline(task: Partial<Task> | null | undefined): UpcomingDeadlineDto {
    if (!task) {
      return null as unknown as UpcomingDeadlineDto;
    }
    const projectName = task.project && typeof task.project === 'object'
      ? (task.project as any).name || ''
      : 'N/A';
    const temp = task as { _id?: { toString(): string } };
    return {
      id: task.id || temp._id?.toString() || '',
      title: task.title || '',
      dueDate: task.dueDate,
      priority: task.priority || '',
      projectName,
    };
  }

  static toUpcomingDeadlineList(tasks: Partial<Task>[] | null | undefined): UpcomingDeadlineDto[] {
    if (!tasks) {
      return [];
    }
    return tasks.map(task => this.toUpcomingDeadline(task));
  }

  static toAdminStats(stats: any): AdminStatsDto {
    return {
      totalEmployees: stats.totalEmployees || 0,
      totalProjects: stats.totalProjects || 0,
      totalTasks: stats.totalTasks || 0,
      taskCompletion: {
        completed: stats.taskCompletion?.completed || 0,
        pending: stats.taskCompletion?.pending || 0,
        breakdown: {
          todo: stats.taskCompletion?.breakdown?.todo || 0,
          inProgress: stats.taskCompletion?.breakdown?.inProgress || 0,
          review: stats.taskCompletion?.breakdown?.review || 0,
          completed: stats.taskCompletion?.breakdown?.completed || 0,
        },
      },
      projectProgress: {
        planning: stats.projectProgress?.planning || 0,
        active: stats.projectProgress?.active || 0,
        completed: stats.projectProgress?.completed || 0,
        onHold: stats.projectProgress?.onHold || 0,
      },
      recentActivities: this.toRecentActivityList(stats.recentTasks),
    };
  }

  static toEmployeeStats(stats: any): EmployeeStatsDto {
    return {
      assignedProjectsCount: stats.assignedProjectsCount || 0,
      tasksOverview: {
        total: stats.tasksOverview?.total || 0,
        completed: stats.tasksOverview?.completed || 0,
        pending: stats.tasksOverview?.pending || 0,
        breakdown: {
          todo: stats.tasksOverview?.breakdown?.todo || 0,
          inProgress: stats.tasksOverview?.breakdown?.inProgress || 0,
          review: stats.tasksOverview?.breakdown?.review || 0,
          completed: stats.tasksOverview?.breakdown?.completed || 0,
        },
      },
      priorityDistribution: {
        low: stats.priorityDistribution?.low || 0,
        medium: stats.priorityDistribution?.medium || 0,
        high: stats.priorityDistribution?.high || 0,
      },
      upcomingDeadlines: this.toUpcomingDeadlineList(stats.upcomingDeadlines),
      recentActivities: this.toRecentActivityList(stats.recentTasks),
    };
  }
}

