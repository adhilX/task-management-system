import { Request, Response, NextFunction } from 'express';
import { CreateProjectUseCase } from '../../../application/use-cases/projects/create-project.use-case';
import { DeleteProjectUseCase } from '../../../application/use-cases/projects/delete-project.use-case';
import { FindAllProjectsUseCase } from '../../../application/use-cases/projects/find-all-projects.use-case';
import { FindOneProjectUseCase } from '../../../application/use-cases/projects/find-one-project.use-case';
import { UpdateProjectUseCase } from '../../../application/use-cases/projects/update-project.use-case';
import { sendSuccess } from '../helpers/response.helper';

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly findAllProjectsUseCase: FindAllProjectsUseCase,
    private readonly findOneProjectUseCase: FindOneProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createProjectUseCase.execute(req.body);
      return sendSuccess(res, result, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const result = await this.findAllProjectsUseCase.execute(req.query, user);
      return sendSuccess(res, result, 'Projects retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findOneProjectUseCase.execute(req.params.id);
      return sendSuccess(res, result, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.updateProjectUseCase.execute(req.params.id, req.body);
      return sendSuccess(res, result, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteProjectUseCase.execute(req.params.id);
      return sendSuccess(res, result, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
