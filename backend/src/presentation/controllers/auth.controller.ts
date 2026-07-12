import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/get-current-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { CheckRegistrationStatusUseCase } from '../../application/use-cases/auth/check-registration-status.use-case';
import { VerifyInvitationUseCase } from '../../application/use-cases/auth/verify-invitation.use-case';
import { ActivateEmployeeUseCase } from '../../application/use-cases/auth/activate-employee.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/auth/change-password.use-case';
import { sendSuccess } from '../helpers/response.helper';
import { BadRequestException } from '../../domain/errors/domain.exception';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly checkRegistrationStatusUseCase: CheckRegistrationStatusUseCase,
    private readonly verifyInvitationUseCase: VerifyInvitationUseCase,
    private readonly activateEmployeeUseCase: ActivateEmployeeUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase
  ) {}

  verifyInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.verifyInvitationUseCase.execute(req.params.token);
      return sendSuccess(res, result, 'Invitation link is valid');
    } catch (error) {
      next(error);
    }
  };

  activateInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.activateEmployeeUseCase.execute(req.body);
      return sendSuccess(res, null, 'Account activated successfully');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      await this.changePasswordUseCase.execute(user.id, req.body);
      return sendSuccess(res, null, 'Password changed successfully. Please log in again.');
    } catch (error) {
      next(error);
    }
  };

  registerStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.checkRegistrationStatusUseCase.execute();
      return sendSuccess(res, result, 'Registration status retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

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
      
      const { refreshToken, ...responsePayload } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, responsePayload, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute({ ...req.body, portal: 'admin' });
      
      const { refreshToken, ...responsePayload } = result;

      res.cookie('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, responsePayload, 'Admin Login successful');
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const result = await this.getCurrentUserUseCase.execute(user.id);
      return sendSuccess(res, result, 'Current user profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required');
      }
      const result = await this.refreshTokenUseCase.execute(refreshToken);
      
      const { refreshToken: newRefreshToken, ...responsePayload } = result as any; 

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, responsePayload, 'Tokens refreshed successfully');
    } catch (error) {
      next(error);
    }
  };
  
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };
}
