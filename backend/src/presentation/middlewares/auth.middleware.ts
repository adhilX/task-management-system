import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../application/services/token-service.interface';
import { UnauthorizedException } from '../../domain/errors/domain.exception';

export const createAuthMiddleware = (tokenService: ITokenService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
      }

      const token = authHeader.split(' ')[1];
      const decoded = tokenService.verify(token);
      
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
