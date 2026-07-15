import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/users/find-all-users.use-case';
import { FindOneUserUseCase } from '../../application/use-cases/users/find-one-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.use-case';
import { InviteEmployeeUseCase } from '../../application/use-cases/users/invite-employee.use-case';
import { MongooseUserRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { BcryptService } from '../../infrastructure/security/bcrypt.service';
import { IEmailService } from '../../application/services/email-service.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { rolesMiddleware } from '../middlewares/roles.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { createUserSchema, updateUserSchema, updateUserStatusSchema, findAllUsersQuerySchema, inviteEmployeeSchema } from '../validation/user.validation';

export const createUserRouter = (
  userRepository: MongooseUserRepository,
  bcryptService: BcryptService,
  emailService: IEmailService,
  authMiddleware: any
): Router => {
  const router = Router();

  const createUserUseCase = new CreateUserUseCase(userRepository, bcryptService);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const findAllUsersUseCase = new FindAllUsersUseCase(userRepository);
  const findOneUserUseCase = new FindOneUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository, bcryptService);
  const inviteEmployeeUseCase = new InviteEmployeeUseCase(userRepository, emailService);

  const controller = new UserController(
    createUserUseCase,
    deleteUserUseCase,
    findAllUsersUseCase,
    findOneUserUseCase,
    updateUserUseCase,
    inviteEmployeeUseCase
  );

  // Apply Auth and Admin checks globally to all user routes
  router.use(authMiddleware);
  router.use(rolesMiddleware(UserRole.ADMIN));

  /**
   * @openapi
   * /api/v1/users/invite:
   *   post:
   *     tags:
   *       - Users
   *     summary: Invite a new employee
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
   *               - email
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               department:
   *                 type: string
   *     responses:
   *       201:
   *         description: Employee invited successfully
   */
  router.post('/invite', validateBody(inviteEmployeeSchema), controller.invite);


  /**
   * @openapi
   * /api/v1/users:
   *   post:
   *     tags:
   *       - Users
   *     summary: Create a new user
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
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [admin, employee]
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *               department:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *   get:
   *     tags:
   *       - Users
   *     summary: Get all users with query filters
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
   *       - name: role
   *         in: query
   *         schema:
   *           type: string
   *           enum: [admin, employee]
   *       - name: status
   *         in: query
   *         schema:
   *           type: string
   *           enum: [active, inactive]
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   */
  router.post('/', validateBody(createUserSchema), controller.create);
  router.get('/', validateQuery(findAllUsersQuerySchema), controller.findAll);

  /**
   * @openapi
   * /api/v1/users/{id}:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get a user by ID
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
   *         description: User retrieved successfully
   *   patch:
   *     tags:
   *       - Users
   *     summary: Update a user by ID
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
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [admin, employee]
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *               department:
   *                 type: string
   *     responses:
   *       200:
   *         description: User updated successfully
   *   delete:
   *     tags:
   *       - Users
   *     summary: Delete a user by ID
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
   *         description: User deleted successfully
   */
  router.get('/:id', controller.findOne);
  router.patch('/:id', validateBody(updateUserSchema), controller.update);

  /**
   * @openapi
   * /api/v1/users/{id}/status:
   *   patch:
   *     tags:
   *       - Users
   *     summary: Update a user's status by ID
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [active, inactive, pending]
   *     responses:
   *       200:
   *         description: User status updated successfully
   */
  router.patch('/:id/status', validateBody(updateUserStatusSchema), controller.updateStatus);
  router.delete('/:id', controller.delete);

  return router;
};
