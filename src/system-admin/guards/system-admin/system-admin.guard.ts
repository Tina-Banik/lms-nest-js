import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    console.log('the user =>', user);

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const roles = user.roles ?? [];
    console.log('the roles =>', roles);

    if (!roles.includes('SYSTEM_ADMIN')) {
      throw new ForbiddenException('Only SYSTEM_ADMIN can perform this action');
    }
    
    return true;
  }
}
