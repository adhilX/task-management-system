import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { ProjectStatus } from './enums/project-status.enum';

@Injectable()
export class ProjectsRepository {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(project: Partial<Project>): Promise<ProjectDocument> {
    const newProject = new this.projectModel(project);
    const saved = await newProject.save();
    return saved.populate([
      { path: 'manager', select: 'name email role department' },
      { path: 'team', select: 'name email role department' }
    ]);
  }

  async findById(id: string): Promise<ProjectDocument | null> {
    return this.projectModel
      .findById(id)
      .populate('manager', 'name email role department')
      .populate('team', 'name email role department')
      .exec();
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: ProjectStatus;
    userId?: string; // If provided, filters projects where user is manager or team member
  }): Promise<{ projects: ProjectDocument[]; total: number }> {
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

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('manager', 'name email role department')
        .populate('team', 'name email role department')
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return { projects, total };
  }

  async update(id: string, updateData: Partial<Project>): Promise<ProjectDocument | null> {
    return this.projectModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('manager', 'name email role department')
      .populate('team', 'name email role department')
      .exec();
  }

  async delete(id: string): Promise<ProjectDocument | null> {
    return this.projectModel.findByIdAndDelete(id).exec();
  }

  async countAll(): Promise<number> {
    return this.projectModel.countDocuments().exec();
  }

  async countByStatus(status: ProjectStatus): Promise<number> {
    return this.projectModel.countDocuments({ status }).exec();
  }
}
