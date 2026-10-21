import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { verifyMeetToken } from '../../meetings/meeting-tokens';

/** Guard legacy administration endpoints until verified per-member identity is ready. */
@Injectable()
export class AdminMeetingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = String(request.headers?.authorization || '');
    const claims = verifyMeetToken(header.startsWith('Bearer ') ? header.slice(7) : undefined);
    if (claims.role !== 'admin') throw new ForbiddenException('Administrator access required');
    return true;
  }
}
