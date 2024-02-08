import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UserInfoDto } from './dto/user.dto';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from 'src/global/entities/user.entity';
import { UserRegisterType } from 'src/global/types/user.enum';
import { LoginResponseType } from 'src/global/types/response.type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(data: CreateUserDto): Promise<LoginResponseType> {
    await this.dataSource.transaction(async (transctionEntityManager) => {
      const user = await this.userRepository.findOneByUserId(
        transctionEntityManager,
        data.user_id,
      );
      if (user)
        throw new HttpException('Duplicate user id', HttpStatus.BAD_REQUEST);
      await this.userRepository.setNewUser(transctionEntityManager, data);
    });
    const accessToken = await this.userRepository.getJwtAccessToken(
      data.user_id,
      UserRegisterType.LOCAL,
    );
    return { access_token: accessToken, new_user: true };
  }

  async findByUserId(userId: string): Promise<User> {
    let user: User;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      user = await this.userRepository.findOneByUserId(
        transctionEntityManager,
        userId,
      );
    });
    return user;
  }

  async findByUserUuid(access_token: string): Promise<User> {
    const userInfo = await this.getUserInfo(access_token);
    let user: User;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      user = await this.userRepository.findOneByUserUuid(
        transctionEntityManager,
        userInfo.user_uuid,
      );
    });
    return user;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoDto> {
    let user = new User();
    const user_id = this.jwtService.decode(accessToken).user_id;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      user = await this.userRepository.findOneByUserId(
        transctionEntityManager,
        user_id,
      );
    });
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
    await this.dataSource.transaction(async (transctionEntityManager) => {
      await this.userRepository.updateUserNickname(
        transctionEntityManager,
        user_info.user_uuid,
        userNickname,
      );
    });
  }

  async updateUserPassword(
    accessToken: string,
    userPassword: string,
  ): Promise<void> {
    const user_info = await this.getUserInfo(accessToken);
    await this.dataSource.transaction(async (transctionEntityManager) => {
      await this.userRepository.updateUserPassword(
        transctionEntityManager,
        user_info.user_uuid,
        userPassword,
      );
    });
  }
}
