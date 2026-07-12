import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../../services/password-hasher.interface';
import { UnauthorizedException, NotFoundException, BadRequestException } from '../../../domain/errors/domain.exception';

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, dto: any): Promise<void> {
    const { currentPassword, newPassword } = dto;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current password and new password are required');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long');
    }

    // 1. Fetch user including password
    const user = await this.userRepository.findById(userId, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Account password has not been initialized.');
    }

    // 2. Verify current password
    const isPasswordValid = await this.passwordHasher.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // 3. Hash new password
    const hashedNewPassword = await this.passwordHasher.hash(newPassword);

    // 4. Update password
    await this.userRepository.update(userId, {
      password: hashedNewPassword,
    });
  }
}
