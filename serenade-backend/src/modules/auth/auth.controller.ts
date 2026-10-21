import { Controller, Post, UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  // Email-only login previously let any caller impersonate a member/admin.
  // Disabled pending integration with verified Serenade member identity.
  @Post('login')
  login() {
    throw new UnauthorizedException('Legacy email-only login has been disabled.');
  }
}
