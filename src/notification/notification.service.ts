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
import { GlobalFcmService } from 'src/firebase/fcm.service';
import { RecordRepository } from 'src/record/record.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly notificationRepository: NotificationRepository,
    private readonly userService: UserService,
    private readonly globalFcmService: GlobalFcmService,
    private readonly recordRepository: RecordRepository,
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

  async deleteFcmToken(fcm_token: string): Promise<void> {
    await this.notificationRepository.deleteFcmToken(
      this.dataSource.manager,
      fcm_token,
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
    agree_02: boolean,
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
      agree_02,
    );
  }
  async updateOnlyTime(fcm_token: string, time_01: number): Promise<void> {
    const token = await this.notificationRepository.getTokenInfoByFcmToken(
      this.dataSource.manager,
      fcm_token,
    );
    const timeAgree = await this.notificationRepository.getTimeAgreeByAgreeUuid(
      this.dataSource.manager,
      token.agree_uuid,
    );
    await this.notificationRepository.updataOnlyTime(
      this.dataSource.manager,
      timeAgree.agree_uuid,
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

  async sendMessageByUserUuid(
    user_uuid: string,
    title: string,
    body: string,
    data: { [key: string]: string },
  ): Promise<void> {
    const fcm_token = await this.notificationRepository.getFcmTokenByUserUuid(
      this.dataSource.manager,
      user_uuid,
    );
    fcm_token.forEach((fcm_token) => {
      this.globalFcmService.postMessage(
        title,
        body,
        'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
        fcm_token.fcm_token,
        'default',
        data,
      );
    });
  }

  async sendMessageByFcmToken(
    fcm_token: string,
    title: string,
    body: string,
    data: { [key: string]: string },
  ): Promise<void> {
    this.globalFcmService.postMessage(
      title,
      body,
      'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
      fcm_token,
      'default',
      data,
    );
  }

  async sendMarketingMessage(
    title: string,
    body: string,
    data: { [key: string]: string },
  ): Promise<void> {
    const fcm_token = await this.notificationRepository.getMarketingFcmToken(
      this.dataSource.manager,
    );
    fcm_token.forEach((fcm_token) => {
      this.globalFcmService.postMessage(
        title,
        body,
        'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
        fcm_token.fcm_token,
        'default',
        data,
      );
    });
  }

  async sendTimeMessage(
    title: string,
    body: string,
    data: { [key: string]: string },
    type: string,
    time: number,
  ): Promise<void> {
    const fcm_token = await this.notificationRepository.getTimeAgreeFcmToken(
      this.dataSource.manager,
      type,
      time,
    );
    fcm_token.forEach((fcm_token) => {
      this.globalFcmService.postMessage(
        title,
        body,
        'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
        fcm_token.fcm_token,
        'default',
        data,
      );
    });
  }

  async sendRemindMessage(
    title: string,
    body: string,
    data: { [key: string]: string },
  ): Promise<void> {
    const fcm_token = await this.notificationRepository.getRemindAgreeFcmToken(
      this.dataSource.manager,
    );
    fcm_token.forEach((fcm_token) => {
      this.globalFcmService.postMessage(
        title,
        body,
        'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
        fcm_token.fcm_token,
        'default',
        data,
      );
    });
  }

  async sendQuestMessage(
    title: string,
    body: string,
    data: { [key: string]: string },
    type: string,
  ): Promise<void> {
    const fcm_token = await this.notificationRepository.getQuestAgreeFcmToken(
      this.dataSource.manager,
      type,
    );
    fcm_token.forEach((fcm_token) => {
      this.globalFcmService.postMessage(
        title,
        body,
        'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
        fcm_token.fcm_token,
        'default',
        data,
      );
    });
  }

  async sendWeeklyReportMessage(
    user_uuid: string,
    fcm_token: string,
  ): Promise<void> {
    const thisWeek = await this.recordRepository.getWeeklyRecordHistory(
      this.dataSource.manager,
      user_uuid,
      0,
      7,
      0,
    );
    const lastWeek = await this.recordRepository.getWeeklyRecordHistory(
      this.dataSource.manager,
      user_uuid,
      1,
      7,
      0,
    );

    // 독서 시간 및 목표 달성 횟수 계산
    const totalTimeThisWeek = thisWeek
      .flat()
      .reduce((acc, record) => acc + record.total_time, 0);
    const totalTimeLastWeek = lastWeek
      .flat()
      .reduce((acc, record) => acc + record.total_time, 0);

    const achievedThisWeek = thisWeek
      .flat()
      .filter((record) => record.is_achieved).length;
    const achievedLastWeek = lastWeek
      .flat()
      .filter((record) => record.is_achieved).length;

    // 독서 시간 증가율 또는 감소율 메시지
    let timeChangeMessage = '변화가 없어요.';
    if (totalTimeThisWeek > totalTimeLastWeek) {
      timeChangeMessage = `${Math.round(
        ((totalTimeThisWeek - totalTimeLastWeek) / totalTimeLastWeek) * 100,
      )}% 증가했어요.`;
    } else if (totalTimeThisWeek < totalTimeLastWeek) {
      timeChangeMessage = `${Math.round(
        ((totalTimeLastWeek - totalTimeThisWeek) / totalTimeLastWeek) * 100,
      )}% 감소했어요.`;
    }

    // 목표 달성 횟수 증가 또는 감소 메시지
    let achievedChangeMessage = '변화가 없어요.';
    if (achievedThisWeek > achievedLastWeek) {
      achievedChangeMessage = `${
        achievedThisWeek - achievedLastWeek
      }회 증가했어요.`;
    } else if (achievedThisWeek < achievedLastWeek) {
      achievedChangeMessage = `${
        achievedLastWeek - achievedThisWeek
      }회 감소했어요.`;
    }

    const message = `독서 시간이 저번 주에 비해 ${timeChangeMessage} 목표 달성 횟수는 ${achievedChangeMessage}`;

    this.globalFcmService.postMessage(
      '스프릿 주간 독서 리포트',
      message,
      'https://d3ob3cint7tr3s.cloudfront.net/profile.png',
      fcm_token,
    );
  }
}
