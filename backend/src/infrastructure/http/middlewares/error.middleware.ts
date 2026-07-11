import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../../../domain/errors/http.exception';

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error instanceof HttpException ? error.status : 500;
  const errorName = error.name || 'Error';
  const rawMessage = error.message || 'Internal server error';
  
  // Format message as array to match NestJS filter output
  const message = Array.isArray(rawMessage) ? rawMessage : [rawMessage];

  // Specific handling for DB errors
  let finalStatus = status;
  let finalError = errorName;
  let finalMessage = message;

  if (error.name === 'ValidationError') {
    finalStatus = 400;
    finalError = 'ValidationError';
    finalMessage = [error.message];
  } else if (error.name === 'CastError') {
    finalStatus = 400;
    finalError = 'CastError';
    finalMessage = ['Invalid ID format'];
  } else if (error.code === 11000) {
    // Mongo duplicate key error
    finalStatus = 409;
    finalError = 'ConflictError';
    finalMessage = ['Resource already exists'];
  }

  if (finalStatus === 500) {
    console.error(`[Unhandled Error] Method: ${req.method} URL: ${req.url}`, error);
    finalError = 'Internal Server Error';
  }

  return res.status(finalStatus).json({
    success: false,
    statusCode: finalStatus,
    error: finalError,
    message: finalMessage,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
  });
};
