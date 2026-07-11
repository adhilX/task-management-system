import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'name is required',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'password is required',
    'string.min': 'password must be at least 6 characters long',
  }),
  department: Joi.string().allow('').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
  }),
  password: Joi.string().required().messages({
    'any.required': 'password is required',
  }),
});
