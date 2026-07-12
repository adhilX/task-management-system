import * as jwt from 'jsonwebtoken';
import { ITokenService } from '../../application/services/token-service.interface';

export class JwtService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly refreshSecret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: any, options?: { expiresIn?: string }): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: (options?.expiresIn || this.expiresIn) as any,
    });
  }

  signRefresh(payload: any, options?: { expiresIn?: string }): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: (options?.expiresIn || '7d') as any,
    });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }

  verifyRefresh(token: string): any {
    return jwt.verify(token, this.refreshSecret);
  }
}
