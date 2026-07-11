import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsQueryDto } from './dto/projects-query.dto';
import { ProjectDocument } from './schemas/project.schema';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectDocument> {
    return this.projectsRepository.create(createProjectDto as any);
  }

  async findById(id: string): Promise<ProjectDocument> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findAll(query: ProjectsQueryDto, user: { id: string; role: UserRole }) {
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return this.projectsRepository.findAll({
      ...query,
      userId,
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDocument> {
    await this.findById(id);
    const updated = await this.projectsRepository.update(id, updateProjectDto as any);
    if (!updated) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<ProjectDocument> {
    await this.findById(id);
    const deleted = await this.projectsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return deleted;
  }

  async countAll(): Promise<number> {
    return this.projectsRepository.countAll();
  }

  async countByStatus(status: any): Promise<number> {
    return this.projectsRepository.countByStatus(status);
  }
}
