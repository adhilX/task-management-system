import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UnauthorizedException } from '../../../domain/errors/domain.exception';
import { ITokenService } from '../../services/token-service.interface';

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(refreshToken: string) {
    let decoded: any;
    try {
      decoded = this.tokenService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = decoded.sub;
    const user = await this.userRepository.findById(userId, true);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or no refresh token registered');
    }

    const currentTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (currentTokenHash !== user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.tokenService.sign(payload);
    const newRefreshToken = this.tokenService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await this.userRepository.update(user.id!, { refreshToken: hashedRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
