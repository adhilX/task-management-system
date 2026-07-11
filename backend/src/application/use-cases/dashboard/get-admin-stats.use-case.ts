import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { ProjectStatus } from '../../../domain/enums/project-status.enum';

export class GetAdminStatsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute() {
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
      this.userRepository.countAll(),
      this.projectRepository.countAll(),
      this.taskRepository.countAll(),
      this.taskRepository.countByStatus(TaskStatus.COMPLETED),
      this.taskRepository.countByStatus(TaskStatus.TODO),
      this.taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
      this.taskRepository.countByStatus(TaskStatus.REVIEW),
      this.projectRepository.countByStatus(ProjectStatus.PLANNING),
      this.projectRepository.countByStatus(ProjectStatus.ACTIVE),
      this.projectRepository.countByStatus(ProjectStatus.COMPLETED),
      this.projectRepository.countByStatus(ProjectStatus.ON_HOLD),
    ]);

    // Fetch the 5 most recent tasks for recent activity
    const recentTasksResult = await this.taskRepository.findAll({
      page: 1,
      limit: 5,
    });

    const recentActivities = recentTasksResult.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task',
      status: task.status,
      updatedAt: task.updatedAt,
      assigneeName: typeof task.assignee === 'object' && task.assignee !== null
        ? (task.assignee as any).name
        : 'Unassigned',
      projectName: typeof task.project === 'object' && task.project !== null
        ? (task.project as any).name
        : 'N/A',
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
}
