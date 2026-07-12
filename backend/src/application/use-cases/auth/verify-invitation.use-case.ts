import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { BadRequestException } from '../../../domain/errors/domain.exception';

export class VerifyInvitationUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(token: string): Promise<User> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findByInvitationToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Invitation link is invalid.');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException('Invitation has already been accepted or account is active.');
    }

    if (user.invitationExpiresAt && user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation link has expired (24-hour limit).');
    }

    return user;
  }
}
