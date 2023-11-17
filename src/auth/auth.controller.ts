import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoRequestDto } from './dto/auth.dto';
import { LoginResponseType } from 'src/global/types/response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/kakao')
  async login(
    @Body() data: KakaoRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseType> {
    return this.authService.kakaoLogin(data);
  }
}
