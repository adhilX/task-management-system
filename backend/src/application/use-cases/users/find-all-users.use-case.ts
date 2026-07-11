import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';

export class FindAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: any): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(params);
  }
}
