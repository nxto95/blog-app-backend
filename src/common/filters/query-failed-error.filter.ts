import {
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
  UNIQUE_EMAIL,
  UNIQUE_EMAIL_MESSAGE,
  UNIQUE_JTI,
  UNIQUE_JTI_MESSAGE,
  UNIQUE_USERNAME,
  UNIQUE_USERNAME_MESSAGE,
} from '../types/constants';

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError) {
    const error = exception as QueryFailedError & {
      code: string;
      constraint: string;
    };

    if (error.code === '23505') {
      switch (error.constraint) {
        case UNIQUE_USERNAME:
          throw new ConflictException(UNIQUE_USERNAME_MESSAGE);
        case UNIQUE_EMAIL:
          throw new ConflictException(UNIQUE_EMAIL_MESSAGE);
        case UNIQUE_JTI:
          throw new ConflictException(UNIQUE_JTI_MESSAGE);
        default:
          throw new ConflictException('database unhandled conflict');
      }
    }

    throw new InternalServerErrorException('unhandled database error');
  }
}
