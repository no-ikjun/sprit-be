import { Injectable } from '@nestjs/common';
import { User } from 'src/global/entities/user.entity';
import { CreateUserDto } from './dto/user.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { AppleUserDataDto, KakaoUserDataDto } from 'src/auth/dto/auth.dto';
import { UserRegisterType } from 'src/global/types/user.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userReposiotry: Repository<User>,
  ) {}

  async findOneByUserUuid(userUuid: string): Promise<User> {
    return await this.userReposiotry.findOne({
      where: { user_uuid: userUuid },
    });
  }

  async findOneByUserId(userId: string): Promise<User> {
    return await this.userReposiotry.findOne({
      where: { user_id: userId },
    });
  }

  async setNewUser(userData: CreateUserDto): Promise<void> {
    const user_uuid = generateRamdomId(
      'UL' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.encryptPassword(userData);
    await this.userReposiotry.save({
      user_uuid: user_uuid,
      user_nickname: userData.user_nickname,
      user_id: userData.user_id,
      user_password: userData.user_password,
      register_type: UserRegisterType.LOCAL,
      registered_at: new Date(),
    });
  }

  async setNewUserByKakao(kakaoUserDto: KakaoUserDataDto): Promise<string> {
    const kakaoUser = new User();
    const user_uuid = generateRamdomId(
      'UK' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    kakaoUser.user_uuid = user_uuid;
    kakaoUser.user_nickname = kakaoUserDto.user_nickname;
    kakaoUser.user_id = kakaoUserDto.user_id;
    kakaoUser.user_password = '';
    kakaoUser.register_type = UserRegisterType.KAKAO;
    kakaoUser.registered_at = new Date();
    await this.userReposiotry.save(kakaoUser);
    return user_uuid;
  }

  async setNewUserByApple(appleUserDto: AppleUserDataDto): Promise<string> {
    const appleUser = new User();
    const user_uuid = generateRamdomId(
      'UA' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    appleUser.user_uuid = user_uuid;
    appleUser.user_nickname = appleUserDto.user_nickname;
    appleUser.user_id = appleUserDto.user_id;
    appleUser.user_password = '';
    appleUser.register_type = UserRegisterType.APPLE;
    appleUser.registered_at = new Date();
    await this.userReposiotry.save(appleUser);
    return user_uuid;
  }

  public async getJwtAccessToken(
    user_id: string,
    login_type: UserRegisterType,
  ): Promise<string> {
    const payload = { user_id: user_id, login_type: login_type };
    const jwtAccessTokenSecret = this.configService.get(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    const jwtAccessTokenExpire = this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    );
    return this.jwtService.sign(payload, {
      secret: jwtAccessTokenSecret,
      expiresIn: jwtAccessTokenExpire,
    });
  }

  async encryptPassword(user: CreateUserDto): Promise<CreateUserDto> {
    user.user_password = await bcrypt.hash(user.user_password, 10);
    return user;
  }

  async updateUserNickname(
    user_uuid: string,
    user_nickname: string,
  ): Promise<void> {
    await this.userReposiotry.update(
      { user_uuid: user_uuid },
      { user_nickname: user_nickname },
    );
  }

  async updateUserPassword(
    user_uuid: string,
    user_password: string,
  ): Promise<void> {
    const encryptedPassword = await bcrypt.hash(user_password, 10);
    await this.userReposiotry.update(
      { user_uuid: user_uuid },
      { user_password: encryptedPassword },
    );
  }
}
