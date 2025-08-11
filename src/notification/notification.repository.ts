import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FcmToken } from 'src/global/entities/fcm_token.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { SetFcmTokenResponseType } from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    @InjectRepository(TimeAgree)
    private readonly timeAgreeRepository: Repository<TimeAgree>,
    @InjectRepository(RemindAgree)
    private readonly remindAgreeRepository: Repository<RemindAgree>,
    @InjectRepository(QuestAgree)
    private readonly questAgreeRepository: Repository<QuestAgree>,
  ) {}

  async setFcmToken(
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
    await this.fcmTokenRepository.save({
      fcm_token_uuid: fcm_token_uuid,
      user_uuid: user_uuid,
      fcm_token: fcm_token,
      agree_uuid: agree_uuid,
      created_at: new Date(),
    });
    await this.timeAgreeRepository.save({
      agree_uuid: agree_uuid,
      agree_01: true,
      time_01: 20,
      agree_02: true,
    });
    await this.remindAgreeRepository.save({
      agree_uuid: agree_uuid,
      agree_01: true,
      time_01: 7,
    });
    await this.questAgreeRepository.save({
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

  async deleteFcmToken(fcm_token: string): Promise<void> {
    const agree_uuid = await this.getAgreeUuidByFcmToken(fcm_token);
    await this.fcmTokenRepository.delete({ fcm_token: fcm_token });
    await this.timeAgreeRepository.delete({ agree_uuid: agree_uuid });
    await this.remindAgreeRepository.delete({ agree_uuid: agree_uuid });
    await this.questAgreeRepository.delete({ agree_uuid: agree_uuid });
  }

  async getTokenInfoByFcmToken(fcm_token: string): Promise<FcmToken> {
    return await this.fcmTokenRepository.findOne({
      where: { fcm_token: fcm_token },
    });
  }

  async updtateUserByFcmTokenUuid(
    fcm_token_uuid: string,
    user_uuid: string,
  ): Promise<SetFcmTokenResponseType> {
    await this.fcmTokenRepository.update(
      { fcm_token_uuid: fcm_token_uuid },
      { user_uuid: user_uuid, updated_at: new Date() },
    );
    const fcm_token = await this.fcmTokenRepository.findOne({
      where: { fcm_token_uuid: fcm_token_uuid },
    });
    await this.timeAgreeRepository.update(
      { agree_uuid: fcm_token.agree_uuid },
      { agree_01: true, time_01: 20, agree_02: true },
    );
    await this.remindAgreeRepository.update(
      { agree_uuid: fcm_token.agree_uuid },
      { agree_01: true, time_01: 7 },
    );
    await this.questAgreeRepository.update(
      { agree_uuid: fcm_token.agree_uuid },
      { agree_01: true, agree_02: true, agree_03: true },
    );
    return {
      fcm_token: fcm_token.fcm_token,
      agree_uuid: fcm_token.agree_uuid,
    };
  }

  async getFcmTokenByUserUuid(user_uuid: string): Promise<FcmToken[]> {
    return await this.fcmTokenRepository.find({
      where: { user_uuid: user_uuid },
    });
  }

  async getAgreeUuidByFcmToken(fcm_token: string): Promise<string> {
    const fcm_token_entity = await this.fcmTokenRepository.findOne({
      where: { fcm_token: fcm_token },
    });
    return fcm_token_entity.agree_uuid;
  }

  async getMarketingAgreeByFcmToken(fcm_token: string): Promise<boolean> {
    const fcm_token_entity = await this.fcmTokenRepository.findOne({
      where: { fcm_token: fcm_token },
    });
    return fcm_token_entity.marketing_agree;
  }

  async updateMarketingAgreeByFcmToken(
    fcm_token_uuid: string,
    marketing_agree: boolean,
  ): Promise<void> {
    await this.fcmTokenRepository.update(
      { fcm_token_uuid: fcm_token_uuid },
      { marketing_agree: marketing_agree, agreed_at: new Date() },
    );
  }

  async getTimeAgreeByAgreeUuid(agree_uuid: string): Promise<TimeAgree> {
    return await this.timeAgreeRepository.findOne({
      where: { agree_uuid: agree_uuid },
    });
  }

  async updateTimeAgree(
    agree_uuid: string,
    agree_01: boolean,
    time: number,
    agree_02: boolean,
  ): Promise<void> {
    await this.timeAgreeRepository.update(
      { agree_uuid: agree_uuid },
      { agree_01: agree_01, time_01: time, agree_02: agree_02 },
    );
  }

  async updateOnlyTime(agree_uuid: string, time: number): Promise<void> {
    await this.timeAgreeRepository.update(
      { agree_uuid: agree_uuid },
      { time_01: time },
    );
  }

  async getRemindAgreeByAgreeUuid(agree_uuid: string): Promise<RemindAgree> {
    return await this.remindAgreeRepository.findOne({
      where: { agree_uuid: agree_uuid },
    });
  }

  async updateRemindAgree(
    agree_uuid: string,
    agree: boolean,
    time: number,
  ): Promise<void> {
    await this.remindAgreeRepository.update(
      { agree_uuid: agree_uuid },
      { agree_01: agree, time_01: time },
    );
  }

  async getQuestAgreeByAgreeUuid(agree_uuid: string): Promise<QuestAgree> {
    return await this.questAgreeRepository.findOne({
      where: { agree_uuid: agree_uuid },
    });
  }

  async updateQuestAgree(
    agree_uuid: string,
    agree_01: boolean,
    agree_02: boolean,
    agree_03: boolean,
  ): Promise<void> {
    await this.questAgreeRepository.update(
      { agree_uuid: agree_uuid },
      { agree_01: agree_01, agree_02: agree_02, agree_03: agree_03 },
    );
  }

  async getFcmTokenByFcmTokenUuid(fcm_token_uuid: string): Promise<FcmToken> {
    return await this.fcmTokenRepository.findOne({
      where: { fcm_token_uuid: fcm_token_uuid },
    });
  }

  async getMarketingFcmToken(): Promise<FcmToken[]> {
    return await this.fcmTokenRepository.find({
      where: { marketing_agree: true },
    });
  }

  async getTimeAgreeFcmToken(type: string, time?: number): Promise<FcmToken[]> {
    let time_agree;
    if (type === 'agree_02') {
      time_agree = await this.timeAgreeRepository.find({
        where: { agree_02: true },
      });
    } else if (type === 'agree_01') {
      time_agree = await this.timeAgreeRepository.find({
        where: { agree_01: true, time_01: time },
      });
    }
    const promises = time_agree.map(async (agree: TimeAgree) => {
      return await this.fcmTokenRepository.findOne({
        where: { agree_uuid: agree.agree_uuid },
      });
    });
    const result = (await Promise.all(promises)).filter(
      (fcmToken) => fcmToken !== null && fcmToken !== undefined,
    );
    return result;
  }

  async getRemindAgreeFcmToken(): Promise<FcmToken[]> {
    const remind_agree = await this.remindAgreeRepository.find({
      where: { agree_01: true },
    });

    const result = await Promise.all(
      remind_agree.map(async (agree: RemindAgree) => {
        const fcm_token = await this.fcmTokenRepository.findOne({
          where: { agree_uuid: agree.agree_uuid },
        });
        return fcm_token;
      }),
    );

    return result.filter((token) => token !== null && token !== undefined);
  }

  async getQuestAgreeFcmToken(type: string): Promise<FcmToken[]> {
    let quest_agree;
    const result: FcmToken[] = [];
    if (type === 'agree_01') {
      quest_agree = await this.questAgreeRepository.find({
        where: { agree_01: true },
      });
    } else if (type === 'agree_02') {
      quest_agree = await this.questAgreeRepository.find({
        where: { agree_02: true },
      });
    } else if (type === 'agree_03') {
      quest_agree = await this.questAgreeRepository.find({
        where: { agree_03: true },
      });
    }
    quest_agree.map(async (agree: QuestAgree) => {
      const fcm_token = await this.fcmTokenRepository.findOne({
        where: { agree_uuid: agree.agree_uuid },
      });
      result.push(fcm_token);
    });
    return result;
  }
}
