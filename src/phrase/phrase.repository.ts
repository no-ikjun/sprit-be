import { Injectable } from '@nestjs/common';
import { BookService } from 'src/book/book.service';
import { Phrase } from 'src/global/entities/phrase.entity';
import {
  LibraryPhraseResponseType,
  LibraryPhraseResponseTypeV2,
  LibraryPhraseType,
  LibraryPhraseTypeV2,
} from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PhraseRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookService: BookService,
  ) {}

  async setPhrase(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
    phrase: string,
    page: number,
    remind: boolean,
  ): Promise<string> {
    const phrase_uuid = generateRamdomId(
      'PH' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save(Phrase, {
      phrase_uuid: phrase_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      phrase: phrase,
      page: page,
      remind: remind,
      created_at: new Date(),
    });
    await this.bookService.addScoreToBook(book_uuid, 3);
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

  async updatePhrase(
    transactionEntityManager: EntityManager,
    phrase_uuid: string,
    phrase: string,
  ): Promise<void> {
    await transactionEntityManager.update(
      Phrase,
      { phrase_uuid: phrase_uuid },
      { phrase: phrase },
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

  async getPhrasesForLibrary(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    page: number,
  ): Promise<LibraryPhraseResponseType> {
    const pageSize = 3;
    const phraseList: LibraryPhraseType[] = [];
    let moreAvailable = false;
    const phraseListFromDB = await transactionEntityManager.find(Phrase, {
      order: { created_at: 'DESC' },
      where: { user_uuid: user_uuid },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await transactionEntityManager.count(Phrase, {
      where: { user_uuid: user_uuid },
    });
    for (const phrase of phraseListFromDB) {
      const book_info = await this.bookService.findByBookUuid(phrase.book_uuid);
      phraseList.push({
        phrase_uuid: phrase.phrase_uuid,
        book_title: book_info.title,
        phrase: phrase.phrase,
      });
    }
    moreAvailable = totalCount > page * pageSize;
    return {
      library_phrase_list: phraseList,
      more_available: moreAvailable,
    };
  }

  async getPhrasesForLibraryV2(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    page: number,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const pageSize = 3;
    const phraseList: LibraryPhraseTypeV2[] = [];
    let moreAvailable = false;
    const phraseListFromDB = await transactionEntityManager.find(Phrase, {
      order: { created_at: 'DESC' },
      where: { user_uuid: user_uuid },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await transactionEntityManager.count(Phrase, {
      where: { user_uuid: user_uuid },
    });
    for (const phrase of phraseListFromDB) {
      const book_info = await this.bookService.findByBookUuid(phrase.book_uuid);
      phraseList.push({
        phrase_uuid: phrase.phrase_uuid,
        book_title: book_info.title,
        book_thumbnail: book_info.thumbnail,
        phrase: phrase.phrase,
        page: phrase.page,
      });
    }
    moreAvailable = totalCount > page * pageSize;
    return {
      library_phrase_list: phraseList,
      more_available: moreAvailable,
    };
  }
}
