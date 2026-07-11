import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { NotFoundException } from '../../../domain/errors/http.exception';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deleted;
  }
}
