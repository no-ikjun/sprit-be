import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UserInfoDto } from './dto/user.dto';
import { UserRepository } from './user.repository';
import { User } from 'src/global/entities/user.entity';
import { UserRegisterType } from 'src/global/types/user.enum';
import { LoginResponseType } from 'src/global/types/response.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(data: CreateUserDto): Promise<LoginResponseType> {
    const user = await this.userRepository.findOneByUserId(data.user_id);
    if (user)
      throw new HttpException('Duplicate user id', HttpStatus.BAD_REQUEST);
    await this.userRepository.setNewUser(data);
    const accessToken = await this.userRepository.getJwtAccessToken(
      data.user_id,
      UserRegisterType.LOCAL,
    );
    return { access_token: accessToken, new_user: true };
  }

  async findByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.findOneByUserId(userId);
    return user;
  }

  async findByUserUuid(access_token: string): Promise<User> {
    const userInfo = await this.getUserInfo(access_token);
    const user = await this.userRepository.findOneByUserUuid(
      userInfo.user_uuid,
    );
    return user;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoDto> {
    let user = new User();
    const user_id = this.jwtService.decode(accessToken).user_id;
    user = await this.userRepository.findOneByUserId(user_id);
    return {
      user_uuid: user.user_uuid,
      user_nickname: user.user_nickname,
      register_type: user.register_type,
    };
  }

  async updateUserNickname(
    accessToken: string,
    userNickname: string,
  ): Promise<void> {
    const user_info = await this.getUserInfo(accessToken);
    await this.userRepository.updateUserNickname(
      user_info.user_uuid,
      userNickname,
    );
  }

  async updateUserPassword(
    accessToken: string,
    userPassword: string,
  ): Promise<void> {
    const user_info = await this.getUserInfo(accessToken);
    await this.userRepository.updateUserPassword(
      user_info.user_uuid,
      userPassword,
    );
  }
}
