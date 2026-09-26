import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { TrimLowerCase } from '../utils/utils';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(55)
  username: string;

  @IsEmail()
  @TrimLowerCase()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
