import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { TaskDocument } from './schemas/task.schema';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    // 1. Verify project exists
    const project = await this.projectsService.findById(createTaskDto.project);

    // 2. Verify assignee exists
    const assignee = await this.usersService.findById(createTaskDto.assignee);

    // 3. Verify assignee is part of the project team or is the manager
    const assigneeIdStr = assignee._id.toString();
    const managerId = (project.manager as any)._id
      ? (project.manager as any)._id.toString()
      : project.manager.toString();

    const isManager = managerId === assigneeIdStr;
    const isTeamMember = project.team.some((member: any) => {
      const memberId = member._id ? member._id.toString() : member.toString();
      return memberId === assigneeIdStr;
    });

    if (!isManager && !isTeamMember) {
      throw new BadRequestException('The assignee must be a member of the project team or the manager.');
    }

    return this.tasksRepository.create(createTaskDto as any);
  }

  async findById(id: string): Promise<TaskDocument> {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findAll(query: TasksQueryDto, user: { id: string; role: UserRole }) {
    // If user is Employee:
    if (user.role === UserRole.EMPLOYEE) {
      // If querying a project, verify the user belongs to it
      if (query.projectId) {
        const project = await this.projectsService.findById(query.projectId);
        const managerId = (project.manager as any)._id
          ? (project.manager as any)._id.toString()
          : project.manager.toString();

        const isManager = managerId === user.id;
        const isTeamMember = project.team.some((member: any) => {
          const memberId = member._id ? member._id.toString() : member.toString();
          return memberId === user.id;
        });

        if (!isManager && !isTeamMember) {
          throw new ForbiddenException("You do not have access to this project's tasks");
        }
      } else {
        // If not specifying a project, force assigneeId to themselves
        query.assigneeId = user.id;
      }
    }

    return this.tasksRepository.findAll(query);
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: { id: string; role: UserRole },
  ): Promise<TaskDocument> {
    const task = await this.findById(id);

    // If Employee:
    if (user.role === UserRole.EMPLOYEE) {
      // 1. Verify they are the assignee of the task
      const assigneeIdStr = (task.assignee as any)._id
        ? (task.assignee as any)._id.toString()
        : task.assignee.toString();

      if (assigneeIdStr !== user.id) {
        throw new ForbiddenException('You can only update the status of tasks assigned to you');
      }

      // 2. Verify they are only updating status
      const keys = Object.keys(updateTaskDto);
      if (keys.length > 1 || (keys.length === 1 && !updateTaskDto.status)) {
        throw new ForbiddenException('Employees are only allowed to update the status of their assigned tasks');
      }
    } else {
      // Admin: If updating assignee or project, validate them
      if (updateTaskDto.project) {
        await this.projectsService.findById(updateTaskDto.project);
      }
      if (updateTaskDto.assignee) {
        await this.usersService.findById(updateTaskDto.assignee);
      }
    }

    const updated = await this.tasksRepository.update(id, updateTaskDto as any);
    if (!updated) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<TaskDocument> {
    await this.findById(id);
    const deleted = await this.tasksRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return deleted;
  }

  async countAll(): Promise<number> {
    return this.tasksRepository.countAll();
  }

  async countByStatus(status: any): Promise<number> {
    return this.tasksRepository.countByStatus(status);
  }

  async countByAssignee(assigneeId: string): Promise<number> {
    return this.tasksRepository.countByAssignee(assigneeId);
  }

  async countByAssigneeAndStatus(assigneeId: string, status: any): Promise<number> {
    return this.tasksRepository.countByAssigneeAndStatus(assigneeId, status);
  }

  async countByProject(projectId: string): Promise<number> {
    return this.tasksRepository.countByProject(projectId);
  }

  async countByProjectAndStatus(projectId: string, status: any): Promise<number> {
    return this.tasksRepository.countByProjectAndStatus(projectId, status);
  }

  async findUpcomingDeadlines(assigneeId: string, limitCount = 5): Promise<TaskDocument[]> {
    return this.tasksRepository.findUpcomingDeadlines(assigneeId, limitCount);
  }
}
