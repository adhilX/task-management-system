import { IUserRepository } from '../../../../domain/repositories/user-repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { UserStatus } from '../../../../domain/enums/user-status.enum';
import { UserModel } from '../models/user.model';

export class MongooseUserRepository implements IUserRepository {
  async create(user: Partial<User>): Promise<User> {
    const newUser = new UserModel(user);
    const saved = await newUser.save();
    return saved.toJSON() as User;
  }

  async findByEmail(email: string, selectPassword = false): Promise<User | null> {
    const query = UserModel.findOne({ email });
    if (selectPassword) {
      query.select('+password');
    }
    const doc = await query.exec();
    if (!doc) return null;
    
    // Convert to JSON and manually include the password if it was selected
    const userObj = doc.toJSON();
    if (selectPassword && doc.password) {
      userObj.password = doc.password;
    }
    return userObj as User;
  }

  async findById(id: string, selectRefreshToken = false): Promise<User | null> {
    const query = UserModel.findById(id);
    if (selectRefreshToken) {
      query.select('+refreshToken');
    }
    const doc = await query.exec();
    if (!doc) return null;

    const userObj = doc.toJSON();
    if (selectRefreshToken && doc.refreshToken) {
      userObj.refreshToken = doc.refreshToken;
    }
    return userObj as User;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, search, role, status } = params;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [usersDocs, total] = await Promise.all([
      UserModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(filter).exec(),
    ]);

    const users = usersDocs.map(doc => doc.toJSON() as User);
    return { users, total };
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return doc ? (doc.toJSON() as User) : null;
  }

  async delete(id: string): Promise<User | null> {
    const doc = await UserModel.findByIdAndDelete(id).exec();
    return doc ? (doc.toJSON() as User) : null;
  }

  async countAll(): Promise<number> {
    return UserModel.countDocuments().exec();
  }
}
