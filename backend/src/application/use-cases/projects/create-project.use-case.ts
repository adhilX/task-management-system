import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Project } from '../../../domain/entities/project.entity';

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(dto: any): Promise<Project> {
    return this.projectRepository.create(dto);
  }
}
