import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../common/dtos/users.dto';
import { UserEntity } from '../common/entities/users.entity';
import * as argon2 from 'argon2';
import {
  UNIQUE_EMAIL_MESSAGE,
  UNIQUE_USERNAME_MESSAGE,
} from '../common/types/constants';

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateUserDto, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;

    const existingUsername = await mg.exists(UserEntity, {
      where: { username: dto.username },
    });

    if (existingUsername) throw new ConflictException(UNIQUE_USERNAME_MESSAGE);

    const existingEmail = await mg.exists(UserEntity, {
      where: { email: dto.email },
    });

    if (existingEmail) throw new ConflictException(UNIQUE_EMAIL_MESSAGE);

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = mg.create(UserEntity, {
      username: dto.username,
      email: dto.email,
      password: passwordHash,
    });

    return mg.save(UserEntity, user);
  }

  async update(userId: string, dto: UpdateUserDto, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.update(UserEntity, { id: userId }, dto);
    if (result.affected === 0) throw new NotFoundException('user not found');
  }

  async softDelete(userId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.softDelete(UserEntity, { id: userId });
    if (result.affected === 0) throw new NotFoundException('user not found');
  }

  async hardDelete(userId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.delete(UserEntity, { id: userId });
    if (result.affected === 0) throw new NotFoundException('user not found');
  }

  async getByEmail(email: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    return mg.findOne(UserEntity, { where: { email } });
  }
  async getById(id: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    return mg.findOne(UserEntity, { where: { id } });
  }
}
