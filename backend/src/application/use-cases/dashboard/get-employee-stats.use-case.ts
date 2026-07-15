import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';

export class GetEmployeeStatsUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(employeeId: string) {
    // 1. Get assigned projects count
    const projectsResult = await this.projectRepository.findAll({
      page: 1,
      limit: 100,
      userId: employeeId,
    });
    const assignedProjectsCount = projectsResult.total;

    // 2. Fetch tasks assigned to the employee to summarize
    const tasksResult = await this.taskRepository.findAll({
      page: 1,
      limit: 1000,
      assigneeId: employeeId,
    });
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
    const upcomingDeadlines = await this.taskRepository.findUpcomingDeadlines(employeeId, 5);

    // 4. Get recent tasks based on updatedAt
    const recentTasks = [...tasks]
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

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
      upcomingDeadlines,
      recentTasks,
    };
  }
}
