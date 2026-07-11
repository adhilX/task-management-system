import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { ProjectStatus } from '../projects/enums/project-status.enum';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async getAdminStats() {
    const [
      totalEmployees,
      totalProjects,
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      planningProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
    ] = await Promise.all([
      this.usersService.countAll(),
      this.projectsService.countAll(),
      this.tasksService.countAll(),
      this.tasksService.countByStatus(TaskStatus.COMPLETED),
      this.tasksService.countByStatus(TaskStatus.TODO),
      this.tasksService.countByStatus(TaskStatus.IN_PROGRESS),
      this.tasksService.countByStatus(TaskStatus.REVIEW),
      this.projectsService.countByStatus(ProjectStatus.PLANNING),
      this.projectsService.countByStatus(ProjectStatus.ACTIVE),
      this.projectsService.countByStatus(ProjectStatus.COMPLETED),
      this.projectsService.countByStatus(ProjectStatus.ON_HOLD),
    ]);

    // Fetch the 5 most recent tasks for recent activity
    const recentTasksResult = await this.tasksService.findAll(
      { page: 1, limit: 5 },
      { id: '', role: UserRole.ADMIN }
    );

    const recentActivities = recentTasksResult.tasks.map((task) => ({
      id: task._id,
      title: task.title,
      type: 'task',
      status: task.status,
      updatedAt: (task as any).updatedAt,
      assigneeName: (task.assignee as any)?.name || 'Unassigned',
      projectName: (task.project as any)?.name || 'N/A',
    }));

    return {
      totalEmployees,
      totalProjects,
      totalTasks,
      taskCompletion: {
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        breakdown: {
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
        },
      },
      projectProgress: {
        planning: planningProjects,
        active: activeProjects,
        completed: completedProjects,
        onHold: onHoldProjects,
      },
      recentActivities,
    };
  }

  async getEmployeeStats(employeeId: string) {
    // 1. Get assigned projects count
    const projectsResult = await this.projectsService.findAll(
      { page: 1, limit: 100 },
      { id: employeeId, role: UserRole.EMPLOYEE }
    );
    const assignedProjectsCount = projectsResult.total;

    // 2. Fetch tasks assigned to the employee to summarize
    const tasksResult = await this.tasksService.findAll(
      { page: 1, limit: 1000, assigneeId: employeeId },
      { id: employeeId, role: UserRole.EMPLOYEE }
    );
    const tasks = tasksResult.tasks;

    let completedTasksCount = 0;
    let todoTasksCount = 0;
    let inProgressTasksCount = 0;
    let reviewTasksCount = 0;

    let lowPriorityCount = 0;
    let mediumPriorityCount = 0;
    let highPriorityCount = 0;

    tasks.forEach((task) => {
      // Status counts
      if (task.status === TaskStatus.COMPLETED) {
        completedTasksCount++;
      } else if (task.status === TaskStatus.TODO) {
        todoTasksCount++;
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        inProgressTasksCount++;
      } else if (task.status === TaskStatus.REVIEW) {
        reviewTasksCount++;
      }

      // Priority counts
      if (task.priority === TaskPriority.LOW) {
        lowPriorityCount++;
      } else if (task.priority === TaskPriority.MEDIUM) {
        mediumPriorityCount++;
      } else if (task.priority === TaskPriority.HIGH) {
        highPriorityCount++;
      }
    });

    // 3. Find upcoming deadlines
    const upcomingDeadlines = await this.tasksService.findUpcomingDeadlines(employeeId, 5);

    return {
      assignedProjectsCount,
      tasksOverview: {
        total: tasks.length,
        completed: completedTasksCount,
        pending: tasks.length - completedTasksCount,
        breakdown: {
          todo: todoTasksCount,
          inProgress: inProgressTasksCount,
          review: reviewTasksCount,
          completed: completedTasksCount,
        },
      },
      priorityDistribution: {
        low: lowPriorityCount,
        medium: mediumPriorityCount,
        high: highPriorityCount,
      },
      upcomingDeadlines: upcomingDeadlines.map((task) => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        projectName: (task.project as any)?.name || 'N/A',
      })),
    };
  }
}
