import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/users/find-all-users.use-case';
import { FindOneUserUseCase } from '../../application/use-cases/users/find-one-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.use-case';
import { sendSuccess } from '../helpers/response.helper';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createUserUseCase.execute(req.body);
      return sendSuccess(res, result, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findAllUsersUseCase.execute(req.query);
      return sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findOneUserUseCase.execute(req.params.id);
      return sendSuccess(res, result, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.updateUserUseCase.execute(req.params.id, req.body);
      return sendSuccess(res, result, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteUserUseCase.execute(req.params.id);
      return sendSuccess(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
