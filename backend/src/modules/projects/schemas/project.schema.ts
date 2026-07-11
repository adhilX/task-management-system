import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProjectStatus } from '../enums/project-status.enum';
import { User } from '../../users/schemas/user.schema';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
    index: true,
  })
  status: ProjectStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  manager: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [], index: true })
  team: (MongooseSchema.Types.ObjectId | User)[];

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
