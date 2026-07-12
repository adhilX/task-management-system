import Joi from 'joi';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.EMPLOYEE),
  status: Joi.string().valid(...Object.values(UserStatus)).default(UserStatus.ACTIVE),
  department: Joi.string().allow('').optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
  department: Joi.string().allow('').optional(),
});

export const findAllUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
});

export const inviteEmployeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  department: Joi.string().allow('').optional(),
});

