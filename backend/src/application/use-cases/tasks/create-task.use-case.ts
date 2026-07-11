import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { BadRequestException, NotFoundException } from '../../../domain/errors/domain.exception';

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: any): Promise<Task> {
    // 1. Verify project exists
    const project = await this.projectRepository.findById(dto.project);
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.project} not found`);
    }

    // 2. Verify assignee exists
    const assignee = await this.userRepository.findById(dto.assignee);
    if (!assignee) {
      throw new NotFoundException(`User with ID ${dto.assignee} not found`);
    }

    // 3. Verify assignee is part of the project team or is the manager
    const assigneeIdStr = assignee.id?.toString();
    const managerId = typeof project.manager === 'object' && project.manager !== null
      ? (project.manager as any).id?.toString()
      : project.manager.toString();

    const isManager = managerId === assigneeIdStr;
    const isTeamMember = project.team.some((member: any) => {
      const memberId = typeof member === 'object' && member !== null
        ? member.id?.toString()
        : member.toString();
      return memberId === assigneeIdStr;
    });

    if (!isManager && !isTeamMember) {
      throw new BadRequestException('The assignee must be a member of the project team or the manager.');
    }

    return this.taskRepository.create(dto);
  }
}
