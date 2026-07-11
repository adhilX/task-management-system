import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export interface ITaskRepository {
  create(task: Partial<Task>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    assigneeId?: string;
  }): Promise<{ tasks: Task[]; total: number }>;
  update(id: string, updateData: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<Task | null>;
  countAll(): Promise<number>;
  countByStatus(status: TaskStatus): Promise<number>;
  countByAssignee(assigneeId: string): Promise<number>;
  countByAssigneeAndStatus(assigneeId: string, status: TaskStatus): Promise<number>;
  countByProject(projectId: string): Promise<number>;
  countByProjectAndStatus(projectId: string, status: TaskStatus): Promise<number>;
  findUpcomingDeadlines(assigneeId: string, limitCount?: number): Promise<Task[]>;
}
