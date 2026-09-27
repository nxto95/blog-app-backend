import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        NODE_ENV: Joi.string().valid('development', 'production', 'testing'),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required().default('localhost'),
        POSTGRES_PORT: Joi.number().port().default(5432),
        REDIS_PASSWORD: Joi.string().required(),
        JWT_ACCESS_EXPIRES_IN: Joi.number().integer().positive().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.number().integer().positive().required(),
      }).options({ convert: true }),
    }),
  ],
})
export class ConfigurationsModule {}
