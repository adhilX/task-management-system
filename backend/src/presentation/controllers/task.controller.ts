import { Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/tasks/delete-task.use-case';
import { FindAllTasksUseCase } from '../../application/use-cases/tasks/find-all-tasks.use-case';
import { FindOneTaskUseCase } from '../../application/use-cases/tasks/find-one-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task.use-case';
import { sendSuccess } from '../helpers/response.helper';
import { DtoMapper } from '../dtos/dto.mapper';
import { UserRole } from '../../domain/enums/user-role.enum';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly findAllTasksUseCase: FindAllTasksUseCase,
    private readonly findOneTaskUseCase: FindOneTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createTaskUseCase.execute(req.body);
      return sendSuccess(res, DtoMapper.toTask(result), 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }
      const result = await this.findAllTasksUseCase.execute(req.query, user);
      return sendSuccess(res, {
        tasks: DtoMapper.toTaskList(result.tasks),
        total: result.total
      }, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findOneTaskUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toTask(result), 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }
      const result = await this.updateTaskUseCase.execute(req.params.id, req.body, user);
      return sendSuccess(res, DtoMapper.toTask(result), 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteTaskUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toTask(result), 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
