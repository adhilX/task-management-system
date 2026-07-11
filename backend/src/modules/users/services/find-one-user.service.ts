import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class FindOneUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
