import { IUserRepository } from '../../../domain/repositories/user-repository.interface';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class FindAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: any): Promise<{ users: any[]; total: number }> {
    const result = await this.userRepository.findAll(params);
    
    // Filter out administrators
    const nonAdminUsers = result.users.filter((user) => user.role !== UserRole.ADMIN);
    
    // Map only necessary fields to reduce payload size and hide internal fields
    const users = nonAdminUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      department: user.department,
      createdAt: user.createdAt,
    }));

    return {
      users,
      total: users.length,
    };
  }
}
