import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './presentation/swagger';
import { createAuthRouter } from './presentation/routes/auth.routes';
import { createUserRouter } from './presentation/routes/user.routes';
import { createProjectRouter } from './presentation/routes/project.routes';
import { createTaskRouter } from './presentation/routes/task.routes';
import { createDashboardRouter } from './presentation/routes/dashboard.routes';
import { createAuthMiddleware } from './presentation/middlewares/auth.middleware';
import { errorMiddleware } from './presentation/middlewares/error.middleware';
import { MongooseUserRepository } from './infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { MongooseProjectRepository } from './infrastructure/database/mongoose/repositories/mongoose-project.repository';
import { MongooseTaskRepository } from './infrastructure/database/mongoose/repositories/mongoose-task.repository';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { JwtService } from './infrastructure/security/jwt.service';
import { EmailService } from './infrastructure/email/email.service';

export function createApp(config: {
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
  corsOrigin: string;
}): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Instances (Dependency Injection)
  const bcryptService = new BcryptService(config.bcryptSaltRounds);
  const jwtService = new JwtService(config.jwtSecret, config.jwtRefreshSecret, config.jwtExpiresIn);
  const emailService = new EmailService();

  const userRepository = new MongooseUserRepository();
  const projectRepository = new MongooseProjectRepository();
  const taskRepository = new MongooseTaskRepository();

  const authMiddleware = createAuthMiddleware(jwtService);

  // Swagger Documentation at /api/docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Base test route
  app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to TaskFlow API' });
  });

  // Routers
  app.use('/api/auth', createAuthRouter(userRepository, bcryptService, jwtService, authMiddleware));
  app.use('/api/users', createUserRouter(userRepository, bcryptService, emailService, authMiddleware));
  app.use('/api/projects', createProjectRouter(projectRepository, authMiddleware));
  app.use('/api/tasks', createTaskRouter(taskRepository, projectRepository, userRepository, authMiddleware));
  app.use('/api/dashboard', createDashboardRouter(userRepository, projectRepository, taskRepository, authMiddleware));

  // Error Handler
  app.use(errorMiddleware);

  return app;
}
