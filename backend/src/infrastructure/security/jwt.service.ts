import * as jwt from 'jsonwebtoken';
import { ITokenService } from '../../application/services/token-service.interface';

export class JwtService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: any): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
