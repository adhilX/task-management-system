import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { BadRequestException } from '../../../domain/errors/http.exception';

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true, // We allow unknown fields but strip them in use cases / Mongoose schemas if needed, or we can set stripUnknown: true
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => detail.message).join(', ');
      return next(new BadRequestException(details));
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => detail.message).join(', ');
      return next(new BadRequestException(details));
    }

    req.query = value as any;
    next();
  };
};
