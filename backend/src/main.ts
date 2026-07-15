import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGODB_URI',
  'BCRYPT_SALT_ROUNDS',
  'CORS_ORIGIN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`CRITICAL: ${envVar} is not set in environment variables.`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1m'; // Short lived access token
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN!;

async function bootstrap() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Database connected successfully.');

    const app = createApp({
      jwtSecret: JWT_SECRET,
      jwtRefreshSecret: JWT_REFRESH_SECRET,
      jwtExpiresIn: JWT_EXPIRES_IN,
      bcryptSaltRounds: BCRYPT_SALT_ROUNDS,
      corsOrigin: CORS_ORIGIN,
    });

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api/docs`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('Express server closed.');
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
