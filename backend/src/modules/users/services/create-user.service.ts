import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class CreateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser;
  }
}
