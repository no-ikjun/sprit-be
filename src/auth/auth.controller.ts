import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppleRequestDto, KakaoRequestDto, LoginUserDto } from './dto/auth.dto';
import { LoginResponseType } from 'src/global/types/response.type';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() data: LoginUserDto): Promise<LoginResponseType> {
    return await this.authService.login(data);
  }

  @Post('login/kakao')
  async kakaoLogin(
    @Body() data: KakaoRequestDto,
    @Res({ passthrough: true }) res,
  ): Promise<LoginResponseType> {
    return this.authService.kakaoLogin(data);
  }

  @Post('login/apple')
  async appleLogin(
    @Body() data: AppleRequestDto,
    @Res({ passthrough: true }) res,
  ): Promise<LoginResponseType> {
    return this.authService.appleLogin(data);
  }
}
