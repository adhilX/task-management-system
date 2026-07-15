import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { Project } from '../../../domain/entities/project.entity';
import { NotFoundException } from '../../../domain/errors/domain.exception';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

export class FindOneProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  async execute(id: string): Promise<any> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    const totalTasks = await this.taskRepository.countByProject(project.id!);
    const completedTasks = await this.taskRepository.countByProjectAndStatus(project.id!, TaskStatus.COMPLETED);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return {
      ...project,
      progress,
      totalTasks,
      completedTasks,
    };
  }
}
