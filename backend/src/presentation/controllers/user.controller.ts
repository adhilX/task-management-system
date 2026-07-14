import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/users/find-all-users.use-case';
import { FindOneUserUseCase } from '../../application/use-cases/users/find-one-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.use-case';
import { InviteEmployeeUseCase } from '../../application/use-cases/users/invite-employee.use-case';
import { sendSuccess } from '../helpers/response.helper';
import { DtoMapper } from '../dtos/dto.mapper';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findOneUserUseCase: FindOneUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly inviteEmployeeUseCase: InviteEmployeeUseCase
  ) { }

  invite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inviteEmployeeUseCase.execute(req.body);
      return sendSuccess(res, DtoMapper.toUser(result), 'Employee invited successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.createUserUseCase.execute(req.body);
      return sendSuccess(res, DtoMapper.toUser(result), 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findAllUsersUseCase.execute(req.query);
      return sendSuccess(res, {
        users: DtoMapper.toUserList(result.users),
        total: result.total
      }, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  findOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.findOneUserUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toUser(result), 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.updateUserUseCase.execute(req.params.id, req.body);
      return sendSuccess(res, DtoMapper.toUser(result), 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.updateUserUseCase.execute(req.params.id, { status: req.body.status });
      return sendSuccess(res, DtoMapper.toUser(result), 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteUserUseCase.execute(req.params.id);
      return sendSuccess(res, DtoMapper.toUser(result), 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
