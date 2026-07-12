import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/services/password-hasher.interface';

export class BcryptService implements IPasswordHasher {
  constructor(private readonly defaultSaltRounds: number = 10) {}

  async hash(data: string, saltOrRounds?: number | string): Promise<string> {
    return bcrypt.hash(data, saltOrRounds || this.defaultSaltRounds);
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
