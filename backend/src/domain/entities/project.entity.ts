import { ProjectStatus } from '../enums/project-status.enum';
import { User } from './user.entity';

export interface Project {
  id?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  manager: string | User;
  team: (string | User)[];
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
