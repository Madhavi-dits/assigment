import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/user.service';
import { Role } from 'src/utils/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const userDetails = await User.findByPk(user.sub);
    console.log(userDetails);
    // if (requiredRoles.includes(Role.SUPERADMIN)) {
    //   if (userDetails.role === Role.SUPERADMIN && userDetails.id === userId) {
    //     return true; // Superadmin can edit their own profile
    //   } else {
    //     return false; // Superadmin can't edit other superadmins' profiles
    //   }
    // }
    if (userDetails.role === Role.SUPERADMIN) {
      return true; // Superadmin can access everything
    }
    if (
      (userDetails.role === Role.ADMIN || userDetails.role === Role.USER) &&
      (requiredRoles.includes(Role.ADMIN) || requiredRoles.includes(Role.USER))
    ) {
      return false;
    }
    return requiredRoles.some((role) => userDetails?.role?.includes(role));


  }
}