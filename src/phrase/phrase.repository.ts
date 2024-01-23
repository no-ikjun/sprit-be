import { Injectable } from '@nestjs/common';
import { Phrase } from 'src/global/entities/phrase.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PhraseRepository {
  constructor(private readonly dataSource: DataSource) {}

  async setPhrase(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
    phrase: string,
    remind: boolean,
  ): Promise<string> {
    const phrase_uuid = generateRamdomId(
      'PH' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save('phrase', {
      phrase_uuid: phrase_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      phrase: phrase,
      remind: remind,
      created_at: new Date(),
    });
    return phrase_uuid;
  }

  async getPhrasesByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<Phrase[]> {
    return await transactionEntityManager.find(Phrase, {
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getPhraseByPhraseUuid(
    transactionEntityManager: EntityManager,
    phrase_uuid: string,
  ): Promise<Phrase> {
    return await transactionEntityManager.findOne(Phrase, {
      where: { phrase_uuid: phrase_uuid },
    });
  }

  async updatePhraseRemind(
    transactionEntityManager: EntityManager,
    phrase_uuid: string,
    remind: boolean,
  ): Promise<void> {
    await transactionEntityManager.update(
      Phrase,
      { phrase_uuid: phrase_uuid },
      { remind: remind },
    );
  }

  async getRemindPhrase(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<Phrase[]> {
    return await transactionEntityManager.find(Phrase, {
      where: { user_uuid: user_uuid, remind: true },
    });
  }

  async deletePhrase(
    transactionEntityManager: EntityManager,
    phrase_uuid: string,
  ): Promise<void> {
    await transactionEntityManager.delete(Phrase, { phrase_uuid: phrase_uuid });
  }
}
