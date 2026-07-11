import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { ForbiddenException, ConflictException } from '../../../domain/errors/domain.exception';
import { IPasswordHasher } from '../../services/password-hasher.interface';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: any): Promise<User> {
    const totalUsers = await this.userRepository.countAll();
    if (totalUsers > 0) {
      throw new ForbiddenException('Registration is closed. Please ask an Admin to create your account.');
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);
    return this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      department: dto.department || '',
    });
  }
}
