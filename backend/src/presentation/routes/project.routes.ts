import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { CreateProjectUseCase } from '../../application/use-cases/projects/create-project.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/projects/delete-project.use-case';
import { FindAllProjectsUseCase } from '../../application/use-cases/projects/find-all-projects.use-case';
import { FindOneProjectUseCase } from '../../application/use-cases/projects/find-one-project.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/projects/update-project.use-case';
import { FindProjectMembersUseCase } from '../../application/use-cases/projects/find-project-members.use-case';
import { MongooseProjectRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-project.repository';
import { UserRole } from '../../domain/enums/user-role.enum';
import { rolesMiddleware } from '../middlewares/roles.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { createProjectSchema, updateProjectSchema, findAllProjectsQuerySchema } from '../validation/project.validation';

export const createProjectRouter = (
  projectRepository: MongooseProjectRepository,
  authMiddleware: any
): Router => {
  const router = Router();

  const createProjectUseCase = new CreateProjectUseCase(projectRepository);
  const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);
  const findAllProjectsUseCase = new FindAllProjectsUseCase(projectRepository);
  const findOneProjectUseCase = new FindOneProjectUseCase(projectRepository);
  const updateProjectUseCase = new UpdateProjectUseCase(projectRepository);
  const findProjectMembersUseCase = new FindProjectMembersUseCase(projectRepository);

  const controller = new ProjectController(
    createProjectUseCase,
    deleteProjectUseCase,
    findAllProjectsUseCase,
    findOneProjectUseCase,
    updateProjectUseCase,
    findProjectMembersUseCase
  );

  // Authenticate all project routes
  router.use(authMiddleware);

  /**
   * @openapi
   * /api/projects:
   *   post:
   *     tags:
   *       - Projects
   *     summary: Create a new project (Admin only)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
    *               - name
    *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
    *                 enum: [Planning, Active, Completed, On Hold]
    *               team:
   *                 type: array
   *                 items:
   *                   type: string
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Project created successfully
   *   get:
   *     tags:
   *       - Projects
   *     summary: Get all projects (Employees only see assigned projects)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: page
   *         in: query
   *         schema:
   *           type: integer
   *           default: 1
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 10
   *       - name: search
   *         in: query
   *         schema:
   *           type: string
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [Planning, Active, Completed, On Hold]
   *     responses:
   *       200:
   *         description: Projects retrieved successfully
   */
  router.get('/', validateQuery(findAllProjectsQuerySchema), controller.findAll);
  router.post('/', rolesMiddleware(UserRole.ADMIN), validateBody(createProjectSchema), controller.create);

  /**
   * @openapi
   * /api/projects/{id}:
   *   get:
   *     tags:
   *       - Projects
   *     summary: Get project by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Project retrieved successfully
   *   patch:
   *     tags:
   *       - Projects
   *     summary: Update project by ID (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
    *                 enum: [Planning, Active, Completed, On Hold]
    *               team:
   *                 type: array
   *                 items:
   *                   type: string
   *               startDate:
   *                 type: string
   *                 format: date-time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Project updated successfully
   *   delete:
   *     tags:
   *       - Projects
   *     summary: Delete project by ID (Admin only)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Project deleted successfully
   */
  router.get('/:id', controller.findOne);
  router.get('/:id/members', controller.getMembers);
  router.patch('/:id', rolesMiddleware(UserRole.ADMIN), validateBody(updateProjectSchema), controller.update);
  router.delete('/:id', rolesMiddleware(UserRole.ADMIN), controller.delete);

  return router;
};
