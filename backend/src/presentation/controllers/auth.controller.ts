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
import { DtoMapper } from '../dtos/dto.mapper';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

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
      return sendSuccess(res, DtoMapper.toUser(result), 'Invitation link is valid');
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
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }
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
      return sendSuccess(res, DtoMapper.toUser(result), 'Admin user registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      
      const { refreshToken, user, accessToken } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const responsePayload = {
        user: DtoMapper.toUser(user),
        accessToken,
      };

      return sendSuccess(res, responsePayload, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute({ ...req.body, portal: 'admin' });
      
      const { refreshToken, user, accessToken } = result;

      res.cookie('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const responsePayload = {
        user: DtoMapper.toUser(user),
        accessToken,
      };

      return sendSuccess(res, responsePayload, 'Admin Login successful');
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }
      const result = await this.getCurrentUserUseCase.execute(user.id);
      return sendSuccess(res, DtoMapper.toUser(result), 'Current user profile retrieved successfully');
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
      
      const responsePayload = {
        accessToken: result.accessToken,
      };

      res.cookie('refreshToken', result.refreshToken, {
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
