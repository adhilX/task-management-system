import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { CreateTaskUseCase } from '../../application/use-cases/tasks/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/tasks/delete-task.use-case';
import { FindAllTasksUseCase } from '../../application/use-cases/tasks/find-all-tasks.use-case';
import { FindOneTaskUseCase } from '../../application/use-cases/tasks/find-one-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/tasks/update-task.use-case';
import { MongooseTaskRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-task.repository';
import { MongooseProjectRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-project.repository';
import { MongooseUserRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { UserRole } from '../../domain/enums/user-role.enum';
import { rolesMiddleware } from '../middlewares/roles.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { createTaskSchema, updateTaskSchema, findAllTasksQuerySchema } from '../validation/task.validation';

export const createTaskRouter = (
  taskRepository: MongooseTaskRepository,
  projectRepository: MongooseProjectRepository,
  userRepository: MongooseUserRepository,
  authMiddleware: any
): Router => {
  const router = Router();

  const createTaskUseCase = new CreateTaskUseCase(taskRepository, projectRepository, userRepository);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);
  const findAllTasksUseCase = new FindAllTasksUseCase(taskRepository, projectRepository);
  const findOneTaskUseCase = new FindOneTaskUseCase(taskRepository);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, projectRepository, userRepository);

  const controller = new TaskController(
    createTaskUseCase,
    deleteTaskUseCase,
    findAllTasksUseCase,
    findOneTaskUseCase,
    updateTaskUseCase
  );

  // Authenticate all task routes
  router.use(authMiddleware);

  /**
   * @openapi
   * /api/v1/tasks:
   *   post:
   *     tags:
   *       - Tasks
   *     summary: Create a new task (Admin only)
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - project
   *               - assignee
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [To Do, In Progress, Review, Completed]
   *               priority:
   *                 type: string
   *                 enum: [Low, Medium, High]
   *               project:
   *                 type: string
   *               assignee:
   *                 type: string
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Task created successfully
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get all tasks (Employees only see their assigned tasks or tasks of a project they access)
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
   *           enum: [To Do, In Progress, Review, Completed]
   *       - name: priority
   *         in: query
   *         schema:
   *           type: string
   *           enum: [Low, Medium, High]
   *       - name: projectId
   *         in: query
   *         schema:
   *           type: string
   *       - name: assigneeId
   *         in: query
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tasks retrieved successfully
   */
  router.get('/', validateQuery(findAllTasksQuerySchema), controller.findAll);
  router.post('/', rolesMiddleware(UserRole.ADMIN), validateBody(createTaskSchema), controller.create);

  /**
   * @openapi
   * /api/v1/tasks/{id}:
   *   get:
   *     tags:
   *       - Tasks
   *     summary: Get task by ID
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
   *         description: Task retrieved successfully
   *   patch:
   *     tags:
   *       - Tasks
   *     summary: Update task by ID (Employees can only update status of assigned tasks)
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
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [To Do, In Progress, Review, Completed]
   *               priority:
   *                 type: string
   *                 enum: [Low, Medium, High]
   *               project:
   *                 type: string
   *               assignee:
   *                 type: string
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Task updated successfully
   *   delete:
   *     tags:
   *       - Tasks
   *     summary: Delete task by ID (Admin only)
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
   *         description: Task deleted successfully
   */
  router.get('/:id', controller.findOne);
  router.patch('/:id', validateBody(updateTaskSchema), controller.update);
  router.delete('/:id', rolesMiddleware(UserRole.ADMIN), controller.delete);

  return router;
};
