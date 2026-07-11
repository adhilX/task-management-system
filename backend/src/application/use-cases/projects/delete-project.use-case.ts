import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { NotFoundException } from '../../../domain/errors/domain.exception';

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const deleted = await this.projectRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return deleted;
  }
}
