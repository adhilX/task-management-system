import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required().messages({
    'any.required': 'MONGODB_URI is a required environment variable',
  }),
  JWT_SECRET: Joi.string().required().messages({
    'any.required': 'JWT_SECRET is a required environment variable',
  }),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
});
