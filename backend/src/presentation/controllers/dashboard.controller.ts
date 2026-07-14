import { Request, Response, NextFunction } from 'express';
import { GetAdminStatsUseCase } from '../../application/use-cases/dashboard/get-admin-stats.use-case';
import { GetEmployeeStatsUseCase } from '../../application/use-cases/dashboard/get-employee-stats.use-case';
import { UserRole } from '../../domain/enums/user-role.enum';
import { sendSuccess } from '../helpers/response.helper';
import { DtoMapper } from '../dtos/dto.mapper';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export class DashboardController {
  constructor(
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
    private readonly getEmployeeStatsUseCase: GetEmployeeStatsUseCase
  ) {}

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      if (!user) {
        return next(new Error('User not authenticated'));
      }

      if (user.role === UserRole.ADMIN) {
        const rawStats = await this.getAdminStatsUseCase.execute();
        const stats = DtoMapper.toAdminStats(rawStats);
        return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
      } else {
        const rawStats = await this.getEmployeeStatsUseCase.execute(user.id);
        const stats = DtoMapper.toEmployeeStats(rawStats);
        return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
      }
    } catch (error) {
      next(error);
    }
  };
}
