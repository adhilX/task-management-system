import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UnauthorizedException } from '../../../domain/errors/domain.exception';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { IPasswordHasher } from '../../services/password-hasher.interface';
import { ITokenService } from '../../services/token-service.interface';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: any) {
    const user = await this.userRepository.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is deactivated');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.tokenService.sign(payload);
    const refreshToken = this.tokenService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.userRepository.update(user.id!, { refreshToken: hashedRefreshToken });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      accessToken,
      refreshToken,
    };
  }
}
