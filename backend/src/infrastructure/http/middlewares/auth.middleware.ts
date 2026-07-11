import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../security/jwt.service';
import { UnauthorizedException } from '../../../domain/errors/http.exception';

export const createAuthMiddleware = (jwtService: JwtService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwtService.verify(token);
      
      // Attach user payload to request
      (req as any).user = {
        id: decoded.sub,
        _id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(new UnauthorizedException('Invalid token or unauthorized access'));
    }
  };
};
