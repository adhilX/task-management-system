import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { UsersQueryDto } from '../dto/users-query.dto';

@Injectable()
export class FindAllUsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(query: UsersQueryDto) {
    return this.usersRepository.findAll(query);
  }
}
