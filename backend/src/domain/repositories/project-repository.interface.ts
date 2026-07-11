import { Project } from '../entities/project.entity';
import { ProjectStatus } from '../enums/project-status.enum';

export interface IProjectRepository {
  create(project: Partial<Project>): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProjectStatus;
    userId?: string;
  }): Promise<{ projects: Project[]; total: number }>;
  update(id: string, updateData: Partial<Project>): Promise<Project | null>;
  delete(id: string): Promise<Project | null>;
  countAll(): Promise<number>;
  countByStatus(status: ProjectStatus): Promise<number>;
}
