import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../types/constants.js';
import { UserRole } from '../types/enums.js';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
