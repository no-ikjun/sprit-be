import { Injectable } from '@nestjs/common';
import { Quest } from 'src/global/entities/quest.entity';
import { DataSource, In } from 'typeorm';
import { CreateQuestDto } from './dto/quest.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { QuestApplyType } from 'src/global/types/quest.enum';
import { UserService } from 'src/user/user.service';
import { UserInfoDto } from 'src/user/dto/user.dto';
import { AppliedQuestResponseType } from 'src/global/types/response.type';

@Injectable()
export class QuestService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async getActiveQuests(): Promise<Quest[]> {
    let quests: Quest[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      quests = await transctionEntityManager.find(Quest, {
        where: { is_ended: false },
        order: { start_date: 'ASC' },
      });
    });
    return quests;
  }

  async getEndedQuests(): Promise<Quest[]> {
    let quests: Quest[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      quests = await transctionEntityManager.find(Quest, {
        where: { is_ended: true },
        order: { end_date: 'DESC' },
      });
    });
    return quests;
  }

  async setNewQuest(quest: CreateQuestDto): Promise<Quest> {
    const quest_uuid = generateRamdomId(
      'QU' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    return await this.dataSource.transaction(
      async (transctionEntityManager) => {
        try {
          const newQuest = transctionEntityManager.create(Quest, {
            quest_uuid: quest_uuid,
            title: quest.title,
            short_description: quest.short_description,
            long_description: quest.long_description,
            icon_url: quest.icon_url,
            thumbnail_url: quest.thumbnail_url,
            start_date: new Date(quest.start_date),
            end_date: new Date(quest.end_date),
            limit: quest.limit,
            apply_count: 0,
            is_ended: false,
            created_at: new Date(),
          });
          return await transctionEntityManager.save(newQuest);
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
    );
  }

  async applyQuest(
    quest_uuid: string,
    access_token: string,
  ): Promise<QuestApply> {
    const apply_uuid = generateRamdomId(
      'QU' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    return await this.dataSource.transaction(
      async (transctionEntityManager) => {
        try {
          const newApply = transctionEntityManager.create(QuestApply, {
            apply_uuid: apply_uuid,
            quest_uuid: quest_uuid,
            user_uuid: userInfo.user_uuid,
            state: QuestApplyType.APPLY,
            created_at: new Date(),
          });
          await transctionEntityManager.save(newApply);
          await transctionEntityManager.increment(
            Quest,
            { quest_uuid: quest_uuid },
            'apply_count',
            1,
          );
          return newApply;
        } catch (err) {
          console.log(err);
          throw err;
        }
      },
    );
  }

  async getMyActiveQuests(
    access_token: string,
  ): Promise<AppliedQuestResponseType[]> {
    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );
    let quests: AppliedQuestResponseType[];
    let applies: QuestApply[];
    let temp_apply: QuestApply;
    let temp_quest: Quest;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      applies = await transctionEntityManager.find(QuestApply, {
        where: {
          user_uuid: userInfo.user_uuid,
          state: In(['APPLY', 'ONGOING']),
        },
      });
      quests = await Promise.all(
        applies.map(async (apply) => {
          temp_apply = apply;
          temp_quest = await transctionEntityManager.findOne(Quest, {
            where: { quest_uuid: apply.quest_uuid },
          });
          return {
            apply: temp_apply,
            quest: temp_quest,
          };
        }),
      );
    });
    return quests;
  }
}
