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
      decoded = this.tokenService.verifyRefresh(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = decoded.sub;
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.tokenService.sign(payload);
    const newRefreshToken = this.tokenService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
