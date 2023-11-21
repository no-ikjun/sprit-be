import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginResponseType } from 'src/global/types/response.type';
import { CreateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signup(@Body() data: CreateUserDto): Promise<LoginResponseType> {
    return await this.userService.signUp(data);
  }
}
