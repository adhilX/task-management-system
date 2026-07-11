import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { ConflictException } from '../../../domain/errors/domain.exception';
import { IPasswordHasher } from '../../services/password-hasher.interface';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await this.passwordHasher.hash(dto.password);
    return this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
  }
}
