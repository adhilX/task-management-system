import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { NotFoundException } from '../../../domain/errors/http.exception';

export class FindOneProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }
}
