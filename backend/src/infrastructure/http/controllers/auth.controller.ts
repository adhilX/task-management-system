import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { sendSuccess } from '../helpers/response.helper';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      return sendSuccess(res, result, 'Admin user registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };
}
