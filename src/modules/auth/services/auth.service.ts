import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../../../common/interface/jwt-payload.interface';
import { RoleEnum } from '../../../common/constant/role.constant';

interface JwtUser {
  id: string | number;
  name?: string;
  username?: string;
  email?: string;
  role?: RoleEnum;
  temp_password?: string | null;
  telegram_user_id?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private get clientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID')!;
  }

  private get clientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET')!;
  }

  private get redirectUri(): string {
    return this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
  }

  getGoogleAuthUrl(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = new URLSearchParams({
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: 'openid email profile',
    });

    return `${rootUrl}?${options.toString()}`;
  }

  async getGoogleUser(code: string) {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${tokenRes.status} ${errorText}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      throw new Error(`Google userinfo request failed: ${userRes.status} ${errorText}`);
    }

    const profile = await userRes.json();

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    };
  }

  generateJwt(user: JwtUser) {
    const payload: IJwtPayload = {
      id: Number(user.id),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      tempPassword: !!user.temp_password,
      isPhoneValidate: !!user.telegram_user_id,
    };
    const jwt = this.jwtService.sign(payload);

    return { payload, jwt };
  }

  decodeJwt(jwt: string) {
    return this.jwtService.verify(jwt, {
      secret: this.configService.get('JWT_SECRET_KEY'),
    });
  }
}
