import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Trim } from '../utils/utils';

export class CreatePostDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(256)
  title: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
