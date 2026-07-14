import { Request, Response, NextFunction } from 'express';
import { CreateProjectUseCase } from '../../application/use-cases/projects/create-project.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/projects/delete-project.use-case';
import { FindAllProjectsUseCase } from '../../application/use-cases/projects/find-all-projects.use-case';
import { FindOneProjectUseCase } from '../../application/use-cases/projects/find-one-project.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/projects/update-project.use-case';
import { FindProjectMembersUseCase } from '../../application/use-cases/projects/find-project-members.use-case';
import { sendSuccess } from '../helpers/response.helper';
import { DtoMapper } from '../dtos/dto.mapper';
import { UserRole } from '../../domain/enums/user-role.enum';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly findAllProjectsUseCase: FindAllProjectsUseCase,
    private readonly findOneProjectUseCase: FindOneProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly findProjectMembersUseCase: FindProjectMembersUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }
      const result = await this.createProjectUseCase.execute({
        ...req.body,
        manager: user.id,
      });
      return sendSuccess(res, DtoMapper.toProject(result), 'Project created successfully', 201);
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
      const result = await this.findAllProjectsUseCase.execute(req.query, user);
      return sendSuccess(res, {
        projects: DtoMapper.toProjectList(result.projects),
        total: result.total
      }, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findOneProjectUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toProject(result), 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.updateProjectUseCase.execute(req.params.id, req.body);
      return sendSuccess(res, DtoMapper.toProject(result), 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteProjectUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toProject(result), 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findProjectMembersUseCase.execute(req.params.id);
      const members = result.map((member) => {
        if (typeof member === 'object' && member !== null) {
          return DtoMapper.toUser(member);
        }
        return member;
      });
      return sendSuccess(res, members, 'Project members retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
