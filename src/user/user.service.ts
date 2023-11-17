import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from 'src/global/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
  ) {}

  async createUesr(data: CreateUserDto): Promise<string> {
    await this.dataSource.transaction(async (transctionEntityManager) => {
      const user = await this.userRepository.findOneByUserId(
        transctionEntityManager,
        data.user_id,
      );
      if (user) throw new Error('이미 존재하는 아이디입니다.');
      await this.userRepository.setNewUser(transctionEntityManager, data);
    });
    return data.user_id;
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
}
