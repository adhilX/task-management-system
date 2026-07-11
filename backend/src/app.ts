import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/http/swagger';
import { createAuthRouter } from './infrastructure/http/routes/auth.routes';
import { createUserRouter } from './infrastructure/http/routes/user.routes';
import { createProjectRouter } from './infrastructure/http/routes/project.routes';
import { createTaskRouter } from './infrastructure/http/routes/task.routes';
import { createDashboardRouter } from './infrastructure/http/routes/dashboard.routes';
import { createAuthMiddleware } from './infrastructure/http/middlewares/auth.middleware';
import { errorMiddleware } from './infrastructure/http/middlewares/error.middleware';
import { MongooseUserRepository } from './infrastructure/database/mongoose/repositories/mongoose-user.repository';
import { MongooseProjectRepository } from './infrastructure/database/mongoose/repositories/mongoose-project.repository';
import { MongooseTaskRepository } from './infrastructure/database/mongoose/repositories/mongoose-task.repository';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { JwtService } from './infrastructure/security/jwt.service';

export function createApp(config: {
  jwtSecret: string;
  jwtExpiresIn: string;
}): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Instances (Dependency Injection)
  const bcryptService = new BcryptService();
  const jwtService = new JwtService(config.jwtSecret, config.jwtExpiresIn);

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
  app.use('/api/auth', createAuthRouter(userRepository, bcryptService, jwtService));
  app.use('/api/users', createUserRouter(userRepository, bcryptService, authMiddleware));
  app.use('/api/projects', createProjectRouter(projectRepository, authMiddleware));
  app.use('/api/tasks', createTaskRouter(taskRepository, projectRepository, userRepository, authMiddleware));
  app.use('/api/dashboard', createDashboardRouter(userRepository, projectRepository, taskRepository, authMiddleware));

  // Error Handler
  app.use(errorMiddleware);

  return app;
}
