import { Injectable } from '@nestjs/common';
import { User } from 'src/global/entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { AppleUserDataDto, KakaoUserDataDto } from 'src/auth/dto/auth.dto';
import { UserRegisterType } from 'src/global/types/user.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async findOneByUserUuid(
    transctionEntityManager: EntityManager,
    userUuid: string,
  ): Promise<User> {
    const user = await transctionEntityManager.findOne(User, {
      where: { user_uuid: userUuid },
    });
    return user;
  }

  async findOneByUserId(
    transctionEntityManager: EntityManager,
    userId: string,
  ): Promise<User> {
    const user = await transctionEntityManager.findOne(User, {
      where: { user_id: userId },
    });
    return user;
  }

  async setNewUser(
    transctionEntityManager: EntityManager,
    userData: CreateUserDto,
  ): Promise<void> {
    const user_uuid = generateRamdomId(
      'UL' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.encryptPassword(userData);
    await transctionEntityManager.save(User, {
      user_uuid: user_uuid,
      user_nickname: userData.user_nickname,
      user_id: userData.user_id,
      user_password: userData.user_password,
      register_type: UserRegisterType.LOCAL,
      registered_at: new Date(),
    });
  }

  async setNewUserByKakao(
    transactionentityManager: EntityManager,
    kakaoUserDto: KakaoUserDataDto,
  ): Promise<string> {
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
    await transactionentityManager.save(User, kakaoUser);
    return user_uuid;
  }

  async setNewUserByApple(
    transactionentityManager: EntityManager,
    appleUserDto: AppleUserDataDto,
  ): Promise<string> {
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
    await transactionentityManager.save(User, appleUser);
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
    transactionEntityManager: EntityManager,
    user_uuid: string,
    user_nickname: string,
  ): Promise<void> {
    await transactionEntityManager.update(
      User,
      { user_uuid: user_uuid },
      { user_nickname: user_nickname },
    );
  }

  async updateUserPassword(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    user_password: string,
  ): Promise<void> {
    const encryptedPassword = await bcrypt.hash(user_password, 10);
    await transactionEntityManager.update(
      User,
      { user_uuid: user_uuid },
      { user_password: encryptedPassword },
    );
  }
}
