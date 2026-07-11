import Joi from 'joi';
import { ProjectStatus } from '../../domain/enums/project-status.enum';

export const createProjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(ProjectStatus)).default(ProjectStatus.PLANNING),
  manager: Joi.string().required(),
  team: Joi.array().items(Joi.string()).default([]),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(ProjectStatus)).optional(),
  manager: Joi.string().optional(),
  team: Joi.array().items(Joi.string()).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const findAllProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid(...Object.values(ProjectStatus)).optional(),
});
