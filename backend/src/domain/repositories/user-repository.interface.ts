import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findByEmail(email: string, selectPassword?: boolean): Promise<User | null>;
  findById(id: string, selectPassword?: boolean): Promise<User | null>;
  findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<{ users: User[]; total: number }>;
  update(id: string, updateData: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<User | null>;
  countAll(filter?: { role?: UserRole }): Promise<number>;
  findByInvitationToken(token: string): Promise<User | null>;
}
