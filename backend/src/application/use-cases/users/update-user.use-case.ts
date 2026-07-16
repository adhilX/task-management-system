import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { NotFoundException } from '../../../domain/errors/domain.exception';

export interface UpdateUserDto {
  name?: string;
  department?: string;
  status?: string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) { }

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updateData: Partial<User> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.department !== undefined) updateData.department = dto.department;
    if (dto.status !== undefined) updateData.status = dto.status as any;

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }
}
