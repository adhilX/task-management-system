import { ITaskRepository } from '../../../../domain/repositories/task-repository.interface';
import { Task } from '../../../../domain/entities/task.entity';
import { TaskStatus } from '../../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../../domain/enums/task-priority.enum';
import { TaskModel } from '../models/task.model';

export class MongooseTaskRepository implements ITaskRepository {
  async create(task: Partial<Task>): Promise<Task> {
    const newTask = new TaskModel(task);
    const saved = await newTask.save();
    const populated = await saved.populate([
      { path: 'project', select: 'name status' },
      { path: 'assignee', select: 'name email role department' }
    ]);
    return populated.toJSON() as Task;
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await TaskModel.findById(id)
      .populate('project', 'name status')
      .populate('assignee', 'name email role department')
      .exec();
    return doc ? (doc.toJSON() as Task) : null;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string;
    assigneeId?: string;
  }): Promise<{ tasks: Task[]; total: number }> {
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

    const [taskDocs, total] = await Promise.all([
      TaskModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('project', 'name status')
        .populate('assignee', 'name email role department')
        .exec(),
      TaskModel.countDocuments(filter).exec(),
    ]);

    const tasks = taskDocs.map(doc => doc.toJSON() as Task);
    return { tasks, total };
  }

  async update(id: string, updateData: Partial<Task>): Promise<Task | null> {
    const doc = await TaskModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('project', 'name status')
      .populate('assignee', 'name email role department')
      .exec();
    return doc ? (doc.toJSON() as Task) : null;
  }

  async delete(id: string): Promise<Task | null> {
    const doc = await TaskModel.findByIdAndDelete(id).exec();
    return doc ? (doc.toJSON() as Task) : null;
  }

  async countAll(): Promise<number> {
    return TaskModel.countDocuments().exec();
  }

  async countByStatus(status: TaskStatus): Promise<number> {
    return TaskModel.countDocuments({ status }).exec();
  }

  async countByAssignee(assigneeId: string): Promise<number> {
    return TaskModel.countDocuments({ assignee: assigneeId }).exec();
  }

  async countByAssigneeAndStatus(assigneeId: string, status: TaskStatus): Promise<number> {
    return TaskModel.countDocuments({ assignee: assigneeId, status }).exec();
  }

  async countByProject(projectId: string): Promise<number> {
    return TaskModel.countDocuments({ project: projectId }).exec();
  }

  async countByProjectAndStatus(projectId: string, status: TaskStatus): Promise<number> {
    return TaskModel.countDocuments({ project: projectId, status }).exec();
  }

  async findUpcomingDeadlines(assigneeId: string, limitCount = 5): Promise<Task[]> {
    const docs = await TaskModel.find({
      assignee: assigneeId,
      status: { $ne: TaskStatus.COMPLETED },
      dueDate: { $exists: true, $ne: null },
    })
      .sort({ dueDate: 1 })
      .limit(limitCount)
      .populate('project', 'name')
      .exec();
    return docs.map(doc => doc.toJSON() as Task);
  }
}
