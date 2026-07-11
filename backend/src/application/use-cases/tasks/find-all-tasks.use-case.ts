import { ITaskRepository } from '../../../domain/repositories/task-repository.interface';
import { IProjectRepository } from '../../../domain/repositories/project-repository.interface';
import { Task } from '../../../domain/entities/task.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenException, NotFoundException } from '../../../domain/errors/domain.exception';

export class FindAllTasksUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(query: any, user: { id: string; role: UserRole }): Promise<{ tasks: Task[]; total: number }> {
    const params = { ...query };

    // If user is Employee:
    if (user.role === UserRole.EMPLOYEE) {
      // If querying a project, verify the user belongs to it
      if (params.projectId) {
        const project = await this.projectRepository.findById(params.projectId);
        if (!project) {
          throw new NotFoundException(`Project with ID ${params.projectId} not found`);
        }

        const managerId = typeof project.manager === 'object' && project.manager !== null
          ? (project.manager as any).id?.toString()
          : project.manager.toString();

        const isManager = managerId === user.id;
        const isTeamMember = project.team.some((member: any) => {
          const memberId = typeof member === 'object' && member !== null
            ? member.id?.toString()
            : member.toString();
          return memberId === user.id;
        });

        if (!isManager && !isTeamMember) {
          throw new ForbiddenException("You do not have access to this project's tasks");
        }
      } else {
        // If not specifying a project, force assigneeId to themselves
        params.assigneeId = user.id;
      }
    }

    return this.taskRepository.findAll(params);
  }
}
