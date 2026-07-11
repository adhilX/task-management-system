import { Request, Response, NextFunction } from 'express';
import { GetAdminStatsUseCase } from '../../../application/use-cases/dashboard/get-admin-stats.use-case';
import { GetEmployeeStatsUseCase } from '../../../application/use-cases/dashboard/get-employee-stats.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { sendSuccess } from '../helpers/response.helper';

export class DashboardController {
  constructor(
    private readonly getAdminStatsUseCase: GetAdminStatsUseCase,
    private readonly getEmployeeStatsUseCase: GetEmployeeStatsUseCase
  ) {}

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      let stats;

      if (user.role === UserRole.ADMIN) {
        stats = await this.getAdminStatsUseCase.execute();
      } else {
        stats = await this.getEmployeeStatsUseCase.execute(user.id);
      }

      return sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
