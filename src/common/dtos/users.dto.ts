import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';
import { TrimLowerCase } from '../utils/utils';

export class CreateUserDto {
  @IsString()
  @Length(2, 55)
  username: string;

  @IsEmail()
  @TrimLowerCase()
  email: string;

  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 0,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'password should contain at least 1 uppercase character and 1 number',
    },
  )
  password: string;
}
