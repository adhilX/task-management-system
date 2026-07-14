import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenException, NotFoundException } from '../../../domain/errors/domain.exception';

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(id: string, dto: any, user: { id: string; role: UserRole }): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // If Employee:
    if (user.role === UserRole.EMPLOYEE) {
      // 1. Verify they are the assignee of the task
      const assigneeIdStr = typeof task.assignee === 'object' && task.assignee !== null
        ? (task.assignee as any).id?.toString()
        : task.assignee.toString();

      if (assigneeIdStr !== user.id) {
        throw new ForbiddenException('You can only update the status of tasks assigned to you');
      }

      // 2. Verify they are only updating status
      const keys = Object.keys(dto);
      if (keys.length > 1 || (keys.length === 1 && !dto.status)) {
        throw new ForbiddenException('Employees are only allowed to update the status of their assigned tasks');
      }
    } else {
      // Admin: If updating assignee or project, validate them
      if (dto.project) {
        const project = await this.projectRepository.findById(dto.project);
        if (!project) {
          throw new NotFoundException(`Project with ID ${dto.project} not found`);
        }
      }
      if (dto.assignee) {
        const assignee = await this.userRepository.findById(dto.assignee);
        if (!assignee) {
          throw new NotFoundException(`User with ID ${dto.assignee} not found`);
        }

        const projectId = dto.project || (typeof task.project === 'object' && task.project !== null ? (task.project as any).id?.toString() : task.project.toString());
        const project = await this.projectRepository.findById(projectId);
        if (project) {
          const assigneeIdStr = assignee.id?.toString();
          const isTeamMember = project.team.some((member: any) => {
            const memberId = typeof member === 'object' && member !== null
              ? member.id?.toString()
              : member.toString();
            return memberId === assigneeIdStr;
          });

          if (!isTeamMember && project.id) {
            const teamIds = project.team.map((member: any) =>
              typeof member === 'object' && member !== null ? member.id?.toString() : member.toString()
            );
            teamIds.push(assigneeIdStr);
            await this.projectRepository.update(project.id, { team: teamIds });
          }
        }
      }
    }

    const updated = await this.taskRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updated;
  }
}
