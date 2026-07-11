import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class FindAllProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(query: any, user: { id: string; role: UserRole }): Promise<{ projects: Project[]; total: number }> {
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return this.projectRepository.findAll({
      ...query,
      userId,
    });
  }
}
