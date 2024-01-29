import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FcmToken } from 'src/global/entities/fcm_token.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { SetFcmTokenResponseType } from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class NotificationRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async setFcmToken(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    fcm_token: string,
  ): Promise<SetFcmTokenResponseType> {
    const fcm_token_uuid = generateRamdomId(
      'FC' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    const agree_uuid = generateRamdomId(
      'AG' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save(FcmToken, {
      fcm_token_uuid: fcm_token_uuid,
      user_uuid: user_uuid,
      fcm_token: fcm_token,
      agree_uuid: agree_uuid,
      created_at: new Date(),
    });
    await transactionEntityManager.save(TimeAgree, {
      agree_uuid: agree_uuid,
      agree_01: true,
      time_01: 20,
      agree_02: true,
    });
    await transactionEntityManager.save(RemindAgree, {
      agree_uuid: agree_uuid,
      agree_01: true,
      time_01: 7,
    });
    await transactionEntityManager.save(QuestAgree, {
      agree_uuid: agree_uuid,
      agree_01: true,
      agree_02: true,
      agree_03: true,
    });
    return {
      fcm_token: fcm_token,
      agree_uuid: agree_uuid,
    };
  }

  async getTokenInfoByFcmToken(
    transactionEntityManager: EntityManager,
    fcm_token: string,
  ): Promise<FcmToken> {
    const fcm_token_entity = await transactionEntityManager.findOne(FcmToken, {
      where: { fcm_token: fcm_token },
    });
    return fcm_token_entity;
  }

  async updtateUserByFcmTokenUuid(
    transactionEntityManager: EntityManager,
    fcm_token_uuid: string,
    user_uuid: string,
  ): Promise<SetFcmTokenResponseType> {
    await transactionEntityManager.update(
      FcmToken,
      { fcm_token_uuid: fcm_token_uuid },
      { user_uuid: user_uuid, updated_at: new Date() },
    );
    const fcm_token = await transactionEntityManager.findOne(FcmToken, {
      where: { fcm_token_uuid: fcm_token_uuid },
    });
    await transactionEntityManager.update(
      TimeAgree,
      {
        agree_uuid: fcm_token.agree_uuid,
      },
      { agree_01: true, time_01: 20, agree_02: true },
    );
    await transactionEntityManager.update(
      RemindAgree,
      {
        agree_uuid: fcm_token.agree_uuid,
      },
      { agree_01: true, time_01: 7 },
    );
    await transactionEntityManager.update(
      QuestAgree,
      {
        agree_uuid: fcm_token.agree_uuid,
      },
      { agree_01: true, agree_02: true, agree_03: true },
    );
    return {
      fcm_token: fcm_token.fcm_token,
      agree_uuid: fcm_token.agree_uuid,
    };
  }

  async getFcmTokenByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<FcmToken[]> {
    const fcm_tokens = await transactionEntityManager.find(FcmToken, {
      where: { user_uuid: user_uuid },
    });
    return fcm_tokens;
  }

  async getAgreeUuidByFcmToken(
    transactionEntityManager: EntityManager,
    fcm_token: string,
  ): Promise<string> {
    const fcm_token_entity = await transactionEntityManager.findOne(FcmToken, {
      where: { fcm_token: fcm_token },
    });
    return fcm_token_entity.agree_uuid;
  }

  async getMarketingAgreeByFcmToken(
    transactionEntityManager: EntityManager,
    fcm_token: string,
  ): Promise<boolean> {
    const fcm_token_entity = await transactionEntityManager.findOne(FcmToken, {
      where: { fcm_token: fcm_token },
    });
    return fcm_token_entity.marketing_agree;
  }

  async updateMarketingAgreeByFcmToken(
    transactionEntityManager: EntityManager,
    fcm_token_uuid: string,
    marketing_agree: boolean,
  ): Promise<void> {
    await transactionEntityManager.update(
      FcmToken,
      { fcm_token_uuid: fcm_token_uuid },
      { marketing_agree: marketing_agree, agreed_at: new Date() },
    );
  }

  async getTimeAgreeByAgreeUuid(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
  ): Promise<TimeAgree> {
    const time_agree = await transactionEntityManager.findOne(TimeAgree, {
      where: { agree_uuid: agree_uuid },
    });
    return time_agree;
  }

  async updateTimeAgree(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
    agree_01: boolean,
    time: number,
    agree_02: boolean,
  ): Promise<void> {
    await transactionEntityManager.update(
      TimeAgree,
      { agree_uuid: agree_uuid },
      { agree_01: agree_01, time_01: time, agree_02: agree_02 },
    );
  }

  async updataOnlyTime(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
    time: number,
  ): Promise<void> {
    await transactionEntityManager.update(
      TimeAgree,
      { agree_uuid: agree_uuid },
      { time_01: time },
    );
  }

  async getRemindAgreeByAgreeUuid(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
  ): Promise<RemindAgree> {
    const remind_agree = await transactionEntityManager.findOne(RemindAgree, {
      where: { agree_uuid: agree_uuid },
    });
    return remind_agree;
  }

  async updateRemindAgree(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
    agree: boolean,
    time: number,
  ): Promise<void> {
    await transactionEntityManager.update(
      RemindAgree,
      { agree_uuid: agree_uuid },
      { agree_01: agree, time_01: time },
    );
  }

  async getQuestAgreeByAgreeUuid(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
  ): Promise<QuestAgree> {
    const quest_agree = await transactionEntityManager.findOne(QuestAgree, {
      where: { agree_uuid: agree_uuid },
    });
    return quest_agree;
  }

  async updateQuestAgree(
    transactionEntityManager: EntityManager,
    agree_uuid: string,
    agree_01: boolean,
    agree_02: boolean,
    agree_03: boolean,
  ): Promise<void> {
    await transactionEntityManager.update(
      QuestAgree,
      { agree_uuid: agree_uuid },
      { agree_01: agree_01, agree_02: agree_02, agree_03: agree_03 },
    );
  }

  async getFcmTokenByFcmTokenUuid(
    transactionEntityManager: EntityManager,
    fcm_token_uuid: string,
  ): Promise<FcmToken> {
    const fcm_token = await transactionEntityManager.findOne(FcmToken, {
      where: { fcm_token_uuid: fcm_token_uuid },
    });
    return fcm_token;
  }
}
