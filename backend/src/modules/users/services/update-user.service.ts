import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UpdateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
}
