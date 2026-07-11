import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { NotFoundException } from '../../../domain/errors/domain.exception';

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string, dto: any): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updated = await this.projectRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return updated;
  }
}
