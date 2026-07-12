import * as crypto from 'crypto';
import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { ConflictException } from '../../../domain/errors/domain.exception';
import { IEmailService } from '../../services/email-service.interface';

export class InviteEmployeeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(dto: { name: string; email: string; department?: string }): Promise<User> {
    // 1. Prevent duplicate email
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Create employee with status = PENDING and no password
    const newUser = await this.userRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      role: UserRole.EMPLOYEE,
      status: UserStatus.PENDING,
      department: dto.department || '',
      invitationToken: hashedToken,
      invitationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
    });

    // 4. Send Invitation Email using the unhashed token
    await this.emailService.sendInvitation(newUser.email, newUser.name, token);

    return newUser;
  }
}
