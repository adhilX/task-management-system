import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { UserStatus } from '../../../../domain/enums/user-status.enum';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: false, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    department: { type: String, trim: true, default: '' },
    invitationToken: { type: String, select: false },
    invitationExpiresAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.password;
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const UserModel = model<Document & any>('User', UserSchema);
