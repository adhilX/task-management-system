import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not set in environment variables.');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

async function bootstrap() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Database connected successfully.');

    const app = createApp({
      jwtSecret: JWT_SECRET!,
      jwtExpiresIn: JWT_EXPIRES_IN,
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
