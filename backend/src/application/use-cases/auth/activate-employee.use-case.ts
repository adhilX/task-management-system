import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { BadRequestException } from '../../../domain/errors/domain.exception';
import { IPasswordHasher } from '../../services/password-hasher.interface';

export class ActivateEmployeeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: any): Promise<void> {
    const { token, password } = dto;
    if (!password || password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findByInvitationToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Invitation link is invalid.');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException('Account has already been activated.');
    }

    if (user.invitationExpiresAt && user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation link has expired.');
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    await this.userRepository.update(user.id!, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      invitationToken: '', // Clear token
      invitationExpiresAt: undefined, // Clear expiry
    });
  }
}
