import { IUserRepository } from '../../../domain/repositories/user-repository.interface';

export class CheckRegistrationStatusUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<{ isLocked: boolean }> {
    const totalUsers = await this.userRepository.countAll();
    return { isLocked: totalUsers > 0 };
  }
}
