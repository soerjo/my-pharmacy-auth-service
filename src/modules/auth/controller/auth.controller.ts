import { Controller, Post, Get, Query, Res, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedRequest extends Request {
  user: {
    id: string | number;
    name?: string;
    username?: string;
    email?: string;
    role?: unknown;
    temp_password?: string | null;
    telegram_user_id?: string | null;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('google')
  @ApiOperation({ summary: 'Redirect to Google OAuth' })
  redirectToGoogle(@Res() res: Response) {
    const url = this.authService.getGoogleAuthUrl();
    return res.redirect(url);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiQuery({ name: 'code', description: 'Google authorization code' })
  async handleGoogleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const googleUser = await this.authService.getGoogleUser(code);

      const token = this.authService.generateJwt({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        throw new Error('FRONTEND_URL environment variable is not configured');
      }
      const frontendRedirect = `${frontendUrl}/auth/success?token=${token.jwt}`;
      return res.redirect(frontendRedirect);
    } catch (err) {
      console.error(err);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const fallbackUrl = frontendUrl || '/auth/failed';
      return res.redirect(`${fallbackUrl}/auth/failed`);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  async create() {
    throw new HttpException('Not Implemented', HttpStatus.NOT_IMPLEMENTED);
  }
}
