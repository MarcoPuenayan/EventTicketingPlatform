import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../database/entities/user-role.entity';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * Usage: @Roles(RoleType.Admin, RoleType.Organizer)
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
