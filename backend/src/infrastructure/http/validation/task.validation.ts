import Joi from 'joi';
import { TaskStatus } from '../../../domain/enums/task-status.enum';
import { TaskPriority } from '../../../domain/enums/task-priority.enum';

export const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(TaskStatus)).default(TaskStatus.TODO),
  priority: Joi.string().valid(...Object.values(TaskPriority)).default(TaskPriority.MEDIUM),
  project: Joi.string().required(),
  assignee: Joi.string().required(),
  dueDate: Joi.date().iso().optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  project: Joi.string().optional(),
  assignee: Joi.string().optional(),
  dueDate: Joi.date().iso().optional(),
});

export const findAllTasksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  projectId: Joi.string().optional(),
  assigneeId: Joi.string().optional(),
});
