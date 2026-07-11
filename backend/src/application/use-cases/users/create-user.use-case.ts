import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { ConflictException } from '../../../domain/errors/http.exception';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService
  ) {}

  async execute(dto: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await this.bcryptService.hash(dto.password);
    return this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
  }
}
