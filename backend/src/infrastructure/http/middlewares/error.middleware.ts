import { Request, Response, NextFunction } from 'express';
import {
  DomainException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '../../../domain/errors/domain.exception';

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = 500;
  let errorName = error.name || 'Error';
  const rawMessage = error.message || 'Internal server error';

  if (error instanceof DomainException) {
    if (error instanceof BadRequestException) status = 400;
    else if (error instanceof UnauthorizedException) status = 401;
    else if (error instanceof ForbiddenException) status = 403;
    else if (error instanceof NotFoundException) status = 404;
    else if (error instanceof ConflictException) status = 409;
  }
  
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
