import { Schema, model, Document } from 'mongoose';
import { TaskStatus } from '../../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../../domain/enums/task-priority.enum';

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      index: true,
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TaskSchema.index({ status: 1, priority: 1 });

export const TaskModel = model<Document & any>('Task', TaskSchema);
