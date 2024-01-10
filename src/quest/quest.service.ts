import { Injectable } from '@nestjs/common';
import { Quest } from 'src/global/entities/quest.entity';
import { DataSource } from 'typeorm';
import { CreateQuestDto } from './dto/quest.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';

@Injectable()
export class QuestService {
  constructor(private readonly dataSource: DataSource) {}

  async getActiveQuests(): Promise<Quest[]> {
    let quests: Quest[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      quests = await transctionEntityManager.find(Quest, {
        where: { is_ended: false },
        order: { end_date: 'ASC' },
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
}
