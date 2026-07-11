import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class DeleteUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserDocument> {
    const deletedUser = await this.usersRepository.delete(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }
}
