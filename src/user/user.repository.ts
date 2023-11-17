import { Injectable } from '@nestjs/common';
import { User } from 'src/global/entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { KakaoUserDataDto } from 'src/auth/dto/auth.dto';
import { UserRegisterType } from 'src/global/types/user.enum';

@Injectable()
export class UserRepository {
  constructor(private readonly dataSource: DataSource) {}

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
    await transctionEntityManager.save(User, {
      user_uuid: user_uuid,
      user_nickname: userData.user_nickname,
      user_id: userData.user_id,
      user_password: userData.user_password,
      register_type: userData.register_type,
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
    kakaoUser.register_type = UserRegisterType.KAKAO;
    await transactionentityManager.save(User, kakaoUser);
    return user_uuid;
  }
}
