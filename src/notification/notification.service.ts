import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { NotificationRepository } from './notification.repository';
import { SetFcmTokenResponseType } from 'src/global/types/response.type';
import { UserInfoDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';

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

  async getMarketingAgree(fcm_token: string): Promise<boolean> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    return token.marketing_agree;
  }

  async updateMarketingAgree(
    fcm_token: string,
    marketing_agree: boolean,
  ): Promise<void> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    await this.notificationRepository.updateMarketingAgreeByFcmToken(
      this.dataSource.manager,
      token.fcm_token_uuid,
      marketing_agree,
    );
  }

  async getTimeAgree(fcm_token: string): Promise<TimeAgree> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const timeAgree = await this.notificationRepository.getTimeAgreeByAgreeUuid(
      this.dataSource.manager,
      token.agree_uuid,
    );
    return timeAgree;
  }

  async getRemindAgree(fcm_token: string): Promise<RemindAgree> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const remindAgree =
      await this.notificationRepository.getRemindAgreeByAgreeUuid(
        this.dataSource.manager,
        token.agree_uuid,
      );
    return remindAgree;
  }

  async getQuestAgree(fcm_token: string): Promise<QuestAgree> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const questAgree =
      await this.notificationRepository.getQuestAgreeByAgreeUuid(
        this.dataSource.manager,
        token.agree_uuid,
      );
    return questAgree;
  }

  async updateTimeAgree(
    fcm_token: string,
    agree_01: boolean,
    time_01: number,
  ): Promise<void> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const timeAgree = await this.notificationRepository.getTimeAgreeByAgreeUuid(
      this.dataSource.manager,
      token.agree_uuid,
    );
    await this.notificationRepository.updateTimeAgree(
      this.dataSource.manager,
      timeAgree.agree_uuid,
      agree_01,
      time_01,
    );
  }
  async updateRemindAgree(
    fcm_token: string,
    agree_01: boolean,
    time_01: number,
  ): Promise<void> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const remindAgree =
      await this.notificationRepository.getRemindAgreeByAgreeUuid(
        this.dataSource.manager,
        token.agree_uuid,
      );
    await this.notificationRepository.updateRemindAgree(
      this.dataSource.manager,
      remindAgree.agree_uuid,
      agree_01,
      time_01,
    );
  }
  async updateQuestAgree(
    fcm_token: string,
    agree_01: boolean,
    agree_02: boolean,
    agree_03: boolean,
  ): Promise<void> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const questAgree =
      await this.notificationRepository.getQuestAgreeByAgreeUuid(
        this.dataSource.manager,
        token.agree_uuid,
      );
    await this.notificationRepository.updateQuestAgree(
      this.dataSource.manager,
      questAgree.agree_uuid,
      agree_01,
      agree_02,
      agree_03,
    );
  }
}