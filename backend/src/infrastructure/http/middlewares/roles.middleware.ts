import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { ForbiddenException } from '../../../domain/errors/http.exception';

export const rolesMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return next(new ForbiddenException('You do not have permission to access this resource'));
    }
    next();
  };
};
