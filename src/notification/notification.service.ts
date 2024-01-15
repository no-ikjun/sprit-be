import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { NotificationRepository } from './notification.repository';
import { SetFcmTokenResponseType } from 'src/global/types/response.type';
import { UserInfoDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly notificationRepository: NotificationRepository,
    private readonly userService: UserService,
  ) {}

  async setFcmToken(
    access_token: string,
    fcm_token: string,
  ): Promise<SetFcmTokenResponseType> {
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    if (token) {
      if (token.user_uuid === userInfo.user_uuid)
        return { fcm_token: fcm_token, agree_uuid: token.agree_uuid };
      return await this.notificationRepository.updtateUserByFcmTokenUuid(
        this.dataSource.manager,
        token.fcm_token_uuid,
        userInfo.user_uuid,
      );
    }
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.notificationRepository.setFcmToken(
          transactionEntityManager,
          userInfo.user_uuid,
          fcm_token,
        );
      },
    );
  }
}
