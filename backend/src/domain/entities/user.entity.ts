import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
