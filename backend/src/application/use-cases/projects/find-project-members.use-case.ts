import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { NotFoundException } from '../../../domain/errors/domain.exception';
import { User } from '../../../domain/entities/user.entity';

export class FindProjectMembersUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(id: string): Promise<(string | User)[]> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project.team || [];
  }
}
