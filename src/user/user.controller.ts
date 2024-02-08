import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginResponseType } from 'src/global/types/response.type';
import { CreateUserDto, UserInfoDto } from './dto/user.dto';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signup(@Body() data: CreateUserDto): Promise<LoginResponseType> {
    return await this.userService.signUp(data);
  }

  @Get('/info')
  @UseGuards(JwtAccessGuard)
  async getUserInfo(@Req() req): Promise<UserInfoDto> {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.userService.getUserInfo(accessToken);
  }
}
