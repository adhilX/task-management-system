import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { GetAdminStatsUseCase } from '../../../application/use-cases/dashboard/get-admin-stats.use-case';
import { GetEmployeeStatsUseCase } from '../../../application/use-cases/dashboard/get-employee-stats.use-case';
import { MongooseUserRepository } from '../../database/mongoose/repositories/mongoose-user.repository';
import { MongooseProjectRepository } from '../../database/mongoose/repositories/mongoose-project.repository';
import { MongooseTaskRepository } from '../../database/mongoose/repositories/mongoose-task.repository';

export const createDashboardRouter = (
  userRepository: MongooseUserRepository,
  projectRepository: MongooseProjectRepository,
  taskRepository: MongooseTaskRepository,
  authMiddleware: any
): Router => {
  const router = Router();

  const getAdminStatsUseCase = new GetAdminStatsUseCase(userRepository, projectRepository, taskRepository);
  const getEmployeeStatsUseCase = new GetEmployeeStatsUseCase(projectRepository, taskRepository);

  const controller = new DashboardController(getAdminStatsUseCase, getEmployeeStatsUseCase);

  // Authenticate all dashboard routes
  router.use(authMiddleware);

  /**
   * @openapi
   * /api/dashboard/stats:
   *   get:
   *     tags:
   *       - Dashboard
   *     summary: Get dashboard statistics (Returns Admin stats or Employee stats based on JWT role)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dashboard statistics retrieved successfully
   */
  router.get('/stats', controller.getStats);

  return router;
};
