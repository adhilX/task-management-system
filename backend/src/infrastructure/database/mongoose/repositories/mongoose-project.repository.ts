import { IProjectRepository } from '../../../../domain/repositories/project-repository.interface';
import { Project } from '../../../../domain/entities/project.entity';
import { ProjectStatus } from '../../../../domain/enums/project-status.enum';
import { ProjectModel } from '../models/project.model';

export class MongooseProjectRepository implements IProjectRepository {
  async create(project: Partial<Project>): Promise<Project> {
    const newProject = new ProjectModel(project);
    const saved = await newProject.save();
    const populated = await saved.populate([
      { path: 'manager', select: 'name email role department' },
      { path: 'team', select: 'name email role department' }
    ]);
    return populated.toJSON() as Project;
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id)
      .populate('manager', 'name email role department')
      .populate('team', 'name email role department')
      .exec();
    return doc ? (doc.toJSON() as Project) : null;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProjectStatus;
    userId?: string;
  }): Promise<{ projects: Project[]; total: number }> {
    const { page, limit, search, status, userId } = params;
    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    if (userId) {
      filter.$or = [
        { manager: userId },
        { team: userId },
      ];
    }

    const skip = (page - 1) * limit;

    const [projectDocs, total] = await Promise.all([
      ProjectModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('manager', 'name email role department')
        .populate('team', 'name email role department')
        .exec(),
      ProjectModel.countDocuments(filter).exec(),
    ]);

    const projects = projectDocs.map(doc => doc.toJSON() as Project);
    return { projects, total };
  }

  async update(id: string, updateData: Partial<Project>): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('manager', 'name email role department')
      .populate('team', 'name email role department')
      .exec();
    return doc ? (doc.toJSON() as Project) : null;
  }

  async delete(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findByIdAndDelete(id).exec();
    return doc ? (doc.toJSON() as Project) : null;
  }

  async countAll(): Promise<number> {
    return ProjectModel.countDocuments().exec();
  }

  async countByStatus(status: ProjectStatus): Promise<number> {
    return ProjectModel.countDocuments({ status }).exec();
  }
}
