import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/utils/enum/role.enum';

export const HasRole = (...role: Role[]) => SetMetadata('role', role);