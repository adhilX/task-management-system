import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { MongooseUserRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { BcryptService } from '../../infrastructure/security/bcrypt.service';
import { JwtService } from '../../infrastructure/security/jwt.service';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema, adminLoginSchema } from '../validation/auth.validation';

import { GetCurrentUserUseCase } from '../../application/use-cases/auth/get-current-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { CheckRegistrationStatusUseCase } from '../../application/use-cases/auth/check-registration-status.use-case';
import { VerifyInvitationUseCase } from '../../application/use-cases/auth/verify-invitation.use-case';
import { ActivateEmployeeUseCase } from '../../application/use-cases/auth/activate-employee.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/auth/change-password.use-case';

export const createAuthRouter = (
  userRepository: MongooseUserRepository,
  bcryptService: BcryptService,
  jwtService: JwtService,
  authMiddleware: any
): Router => {
  const router = Router();

  const registerUseCase = new RegisterUseCase(userRepository, bcryptService);
  const loginUseCase = new LoginUseCase(userRepository, bcryptService, jwtService);
  const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, jwtService);
  const checkRegistrationStatusUseCase = new CheckRegistrationStatusUseCase(userRepository);
  const verifyInvitationUseCase = new VerifyInvitationUseCase(userRepository);
  const activateEmployeeUseCase = new ActivateEmployeeUseCase(userRepository, bcryptService);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, bcryptService);

  const controller = new AuthController(
    registerUseCase,
    loginUseCase,
    getCurrentUserUseCase,
    refreshTokenUseCase,
    checkRegistrationStatusUseCase,
    verifyInvitationUseCase,
    activateEmployeeUseCase,
    changePasswordUseCase
  );

  /**
   * @openapi
   * /api/v1/auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Register initial Admin user
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
   *               department:
   *                 type: string
   *     responses:
   *       201:
   *         description: Admin user registered successfully
   */
  router.post('/register', validateBody(registerSchema), controller.register);

  /**
   * @openapi
   * /api/v1/auth/register-status:
   *   get:
   *     tags:
   *       - Auth
   *     summary: Check if initial registration (Admin bootstrap) has been done
   *     responses:
   *       200:
   *         description: Registration status retrieved successfully
   */
  router.get('/register-status', controller.registerStatus);

  /**
   * @openapi
   * /api/v1/auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Login to the application
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   */
  router.post('/login', validateBody(loginSchema), controller.login);

  /**
   * @openapi
   * /api/v1/auth/admin/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Admin Login to the application
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Admin Login successful
   */
  router.post('/admin/login', validateBody(adminLoginSchema), controller.adminLogin);

  /**
   * @openapi
   * /api/v1/auth/me:
   *   get:
   *     tags:
   *       - Auth
   *     summary: Get currently authenticated user profile
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   */
  router.get('/me', authMiddleware, controller.me);

  /**
   * @openapi
   * /api/v1/auth/refresh:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Refresh access and refresh tokens
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Tokens refreshed successfully
   */
  router.post('/refresh', controller.refresh);

  /**
   * @openapi
   * /api/v1/auth/logout:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Logout and clear refresh token cookie
   *     responses:
   *       200:
   *         description: Logout successful
   */
  router.post('/logout', controller.logout);

  /**
   * @openapi
   * /api/v1/auth/invite/verify/{token}:
   *   get:
   *     tags:
   *       - Auth
   *     summary: Verify employee invitation token
   *     parameters:
   *       - name: token
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Invitation link is valid
   */
  router.get('/invite/verify/:token', controller.verifyInvite);

  /**
   * @openapi
   * /api/v1/auth/invite/activate:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Activate employee account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *               - password
   *             properties:
   *               token:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Account activated successfully
   */
  router.post('/invite/activate', controller.activateInvite);

  /**
   * @openapi
   * /api/v1/auth/change-password:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Change password
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   */
  router.post('/change-password', authMiddleware, controller.changePassword);

  return router;
};
