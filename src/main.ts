import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { QueryFailedErrorFilter } from './common/filters/query-failed-error.filter';

const logger = new Logger('App');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new QueryFailedErrorFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => logger.log(`http://localhost:${process.env.PORT ?? 3000}`))
  .catch((error) => logger.error(error));
