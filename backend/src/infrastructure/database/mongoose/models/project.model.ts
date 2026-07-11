import { Schema, model, Document } from 'mongoose';
import { ProjectStatus } from '../../../../domain/enums/project-status.enum';

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING,
      index: true,
    },
    manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [], index: true },
    startDate: { type: Date },
    endDate: { type: Date },
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

export const ProjectModel = model<Document & any>('Project', ProjectSchema);
