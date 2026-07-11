import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { Project } from './project.entity';
import { User } from './user.entity';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string | Project;
  assignee: string | User;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
