import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Patch('/nickname')
  @UseGuards(JwtAccessGuard)
  async changeNickname(@Query() query, @Req() req): Promise<void> {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.userService.updateUserNickname(
      accessToken,
      query.nickname,
    );
  }

  @Patch('/password')
  @UseGuards(JwtAccessGuard)
  async changePassword(@Query() query, @Req() req): Promise<void> {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.userService.updateUserPassword(
      accessToken,
      query.password,
    );
  }
}
