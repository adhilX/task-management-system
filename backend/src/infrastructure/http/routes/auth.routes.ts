import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUseCase } from '../../../application/use-cases/auth/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { MongooseUserRepository } from '../../database/mongoose/repositories/mongoose-user.repository';
import { BcryptService } from '../../security/bcrypt.service';
import { JwtService } from '../../security/jwt.service';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validation/auth.validation';

export const createAuthRouter = (
  userRepository: MongooseUserRepository,
  bcryptService: BcryptService,
  jwtService: JwtService
): Router => {
  const router = Router();

  const registerUseCase = new RegisterUseCase(userRepository, bcryptService);
  const loginUseCase = new LoginUseCase(userRepository, bcryptService, jwtService);
  const controller = new AuthController(registerUseCase, loginUseCase);

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

  return router;
};
