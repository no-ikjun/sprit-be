import { Injectable } from '@nestjs/common';
import { Quest } from 'src/global/entities/quest.entity';
import { In, Repository } from 'typeorm';
import { CreateQuestDto } from './dto/quest.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { QuestApplyType } from 'src/global/types/quest.enum';
import { UserService } from 'src/user/user.service';
import { UserInfoDto } from 'src/user/dto/user.dto';
import { AppliedQuestResponseType } from 'src/global/types/response.type';
import { NotificationService } from 'src/notification/notification.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestService {
  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    @InjectRepository(Quest)
    private readonly questRepository: Repository<Quest>,
    @InjectRepository(QuestApply)
    private readonly questApplyRepository: Repository<QuestApply>,
  ) {}

  async getActiveQuests(): Promise<Quest[]> {
    return await this.questRepository.find({
      where: { is_ended: false },
      order: { start_date: 'ASC' },
    });
  }

  async getEndedQuests(): Promise<Quest[]> {
    return await this.questRepository.find({
      where: { is_ended: true },
      order: { end_date: 'DESC' },
    });
  }

  async setNewQuest(quest: CreateQuestDto): Promise<Quest> {
    const quest_uuid = generateRamdomId(
      'QU' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    try {
      const newQuest = this.questRepository.create({
        quest_uuid: quest_uuid,
        title: quest.title,
        short_description: quest.short_description,
        long_description: quest.long_description,
        mission: quest.mission,
        icon_url: quest.icon_url,
        thumbnail_url: quest.thumbnail_url,
        start_date: new Date(quest.start_date),
        end_date: new Date(quest.end_date),
        limit: quest.limit,
        apply_count: 0,
        is_ended: false,
        created_at: new Date(),
      });
      await this.notificationService.sendQuestMessage(
        '새로운 퀘스트가 등록되었어요 🚀',
        `[${quest.title}]\n퀘스트를 완료하고 리워드를 받아보세요!\n*수신거부: 홈->독서 알림설정->새로운 퀘스트 정보`,
        {},
        'agree_01',
      );
      return await this.questRepository.save(newQuest);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findQuestByUuid(quest_uuid: string): Promise<Quest> {
    return await this.questRepository.findOne({
      where: { quest_uuid: quest_uuid },
    });
  }

  async applyQuest(
    access_token: string,
    quest_uuid: string,
    phone_number: string,
  ): Promise<QuestApply> {
    const apply_uuid = generateRamdomId(
      'QU' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    try {
      const newApply = await this.questApplyRepository.create({
        apply_uuid: apply_uuid,
        quest_uuid: quest_uuid,
        user_uuid: userInfo.user_uuid,
        state: QuestApplyType.APPLY,
        phone_number: phone_number,
        created_at: new Date(),
      });
      await this.questApplyRepository.save(newApply);
      await this.questRepository.increment(
        { quest_uuid: quest_uuid },
        'apply_count',
        1,
      );
      return newApply;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findQuestApplyByQuestUuid(
    access_token: string,
    quest_uuid: string,
  ): Promise<QuestApply> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.questApplyRepository.findOne({
      where: { quest_uuid: quest_uuid, user_uuid: user_info.user_uuid },
    });
  }

  async getMyActiveQuests(
    access_token: string,
  ): Promise<AppliedQuestResponseType[]> {
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    let temp_apply: QuestApply;
    let temp_quest: Quest;
    const applies = await this.questApplyRepository.find({
      where: {
        user_uuid: userInfo.user_uuid,
        state: In(['APPLY', 'ONGOING']),
      },
    });
    const quests = await Promise.all(
      applies.map(async (apply) => {
        temp_apply = apply;
        temp_quest = await this.questRepository.findOne({
          where: { quest_uuid: apply.quest_uuid },
        });
        return {
          apply: temp_apply,
          quest: temp_quest,
        };
      }),
    );
    return quests;
  }

  async getMyAllQuests(
    access_token: string,
  ): Promise<AppliedQuestResponseType[]> {
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    let temp_apply: QuestApply;
    let temp_quest: Quest;
    const applies = await this.questApplyRepository.find({
      where: {
        user_uuid: userInfo.user_uuid,
        state: In(['APPLY', 'ONGOING', 'SUCCESS', 'FAIL', 'CHECKING']),
      },
    });
    const quests = await Promise.all(
      applies.map(async (apply) => {
        temp_apply = apply;
        temp_quest = await this.questRepository.findOne({
          where: { quest_uuid: apply.quest_uuid },
        });
        return {
          apply: temp_apply,
          quest: temp_quest,
        };
      }),
    );
    return quests;
  }
}
