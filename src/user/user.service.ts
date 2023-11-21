import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from 'src/global/entities/user.entity';
import { UserRegisterType } from 'src/global/types/user.enum';
import { LoginResponseType } from 'src/global/types/response.type';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
  ) {}

  async signUp(data: CreateUserDto): Promise<LoginResponseType> {
    await this.dataSource.transaction(async (transctionEntityManager) => {
      const user = await this.userRepository.findOneByUserId(
        transctionEntityManager,
        data.user_id,
      );
      if (user) throw new Error('이미 존재하는 아이디입니다.');
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

  async findByUserUuid(userUuid: string): Promise<User> {
    let user: User;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      user = await this.userRepository.findOneByUserUuid(
        transctionEntityManager,
        userUuid,
      );
    });
    return user;
  }
}
