import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { TaskStatus } from './enums/task-status.enum';
import { TaskPriority } from './enums/task-priority.enum';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(task: Partial<Task>): Promise<TaskDocument> {
    const newTask = new this.taskModel(task);
    const saved = await newTask.save();
    return saved.populate([
      { path: 'project', select: 'name status' },
      { path: 'assignee', select: 'name email role department' }
    ]);
  }

  async findById(id: string): Promise<TaskDocument | null> {
    return this.taskModel
      .findById(id)
      .populate('project', 'name status')
      .populate('assignee', 'name email role department')
      .exec();
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    assigneeId?: string;
  }): Promise<{ tasks: TaskDocument[]; total: number }> {
    const { page, limit, search, status, priority, projectId, assigneeId } = params;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (projectId) {
      filter.project = projectId;
    }

    if (assigneeId) {
      filter.assignee = assigneeId;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('project', 'name status')
        .populate('assignee', 'name email role department')
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return { tasks, total };
  }

  async update(id: string, updateData: Partial<Task>): Promise<TaskDocument | null> {
    return this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('project', 'name status')
      .populate('assignee', 'name email role department')
      .exec();
  }

  async delete(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  async countAll(): Promise<number> {
    return this.taskModel.countDocuments().exec();
  }

  async countByStatus(status: TaskStatus): Promise<number> {
    return this.taskModel.countDocuments({ status } as any).exec();
  }

  async countByAssignee(assigneeId: string): Promise<number> {
    return this.taskModel.countDocuments({ assignee: assigneeId } as any).exec();
  }

  async countByAssigneeAndStatus(assigneeId: string, status: TaskStatus): Promise<number> {
    return this.taskModel.countDocuments({ assignee: assigneeId, status } as any).exec();
  }

  async countByProject(projectId: string): Promise<number> {
    return this.taskModel.countDocuments({ project: projectId } as any).exec();
  }

  async countByProjectAndStatus(projectId: string, status: TaskStatus): Promise<number> {
    return this.taskModel.countDocuments({ project: projectId, status } as any).exec();
  }

  async findUpcomingDeadlines(assigneeId: string, limitCount = 5): Promise<TaskDocument[]> {
    return this.taskModel
      .find({
        assignee: assigneeId,
        status: { $ne: TaskStatus.COMPLETED },
        dueDate: { $exists: true, $ne: null },
      } as any)
      .sort({ dueDate: 1 } as any)
      .limit(limitCount)
      .populate('project', 'name')
      .exec();
  }
}
