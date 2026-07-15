import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class FindAllProjectsUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(query: any, user: { id: string; role: UserRole }): Promise<{ projects: any[]; total: number }> {
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    const { projects, total } = await this.projectRepository.findAll({
      ...query,
      userId,
    });

    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await this.taskRepository.countByProject(project.id!);
        const completedTasks = await this.taskRepository.countByProjectAndStatus(project.id!, TaskStatus.COMPLETED);
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
          ...project,
          progress,
          totalTasks,
          completedTasks,
        };
      })
    );

    return { projects: projectsWithProgress, total };
  }
}
