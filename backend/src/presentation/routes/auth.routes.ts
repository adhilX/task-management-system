import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { MongooseUserRepository } from '../../infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { BcryptService } from '../../infrastructure/security/bcrypt.service';
import { JwtService } from '../../infrastructure/security/jwt.service';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validation/auth.validation';

import { GetCurrentUserUseCase } from '../../application/use-cases/auth/get-current-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';

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
  const controller = new AuthController(
    registerUseCase,
    loginUseCase,
    getCurrentUserUseCase,
    refreshTokenUseCase
  );

  /**
   * @openapi
   * /api/auth/register:
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
   * /api/auth/login:
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
   * /api/auth/me:
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
   * /api/auth/refresh:
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

  return router;
};
