import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const isDevelopment =
          config.getOrThrow<string>('NODE_ENV') === 'development';
        return {
          type: 'postgres',
          host: config.getOrThrow<string>('POSTGRES_HOST'),
          port: config.getOrThrow<number>('POSTGRES_PORT'),
          username: config.getOrThrow<string>('POSTGRES_USER'),
          password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
          database: config.getOrThrow<string>('POSTGRES_DB'),
          autoLoadEntities: true,
          synchronize: isDevelopment,
          logging: isDevelopment,
        };
      },
    }),
  ],
})
export class DatabasesModule {}
