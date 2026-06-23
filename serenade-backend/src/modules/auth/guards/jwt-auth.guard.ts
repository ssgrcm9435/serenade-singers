import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      request.user = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET || 'serenade-secret',
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
