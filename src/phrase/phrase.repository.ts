import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/book.service';
import { Phrase } from 'src/global/entities/phrase.entity';
import {
  LibraryPhraseResponseType,
  LibraryPhraseResponseTypeV2,
  LibraryPhraseType,
  LibraryPhraseTypeV2,
} from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class PhraseRepository {
  constructor(
    private readonly bookService: BookService,
    @InjectRepository(Phrase)
    private readonly phraseRepository: Repository<Phrase>,
  ) {}

  async setPhrase(
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
    await this.phraseRepository.save({
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

  async getPhrasesByUserUuid(user_uuid: string): Promise<Phrase[]> {
    return await this.phraseRepository.find({
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getPhraseByPhraseUuid(phrase_uuid: string): Promise<Phrase> {
    return await this.phraseRepository.findOne({
      where: { phrase_uuid: phrase_uuid },
    });
  }

  async updatePhraseRemind(
    phrase_uuid: string,
    remind: boolean,
  ): Promise<void> {
    await this.phraseRepository.update(
      { phrase_uuid: phrase_uuid },
      { remind: remind },
    );
  }

  async updatePhrase(phrase_uuid: string, phrase: string): Promise<void> {
    await this.phraseRepository.update(
      { phrase_uuid: phrase_uuid },
      { phrase: phrase },
    );
  }

  async getRemindPhrase(user_uuid: string): Promise<Phrase[]> {
    return await this.phraseRepository.find({
      where: { user_uuid: user_uuid, remind: true },
    });
  }

  async deletePhrase(phrase_uuid: string): Promise<void> {
    await this.phraseRepository.delete({ phrase_uuid: phrase_uuid });
  }

  async getPhrasesForLibrary(
    user_uuid: string,
    page: number,
  ): Promise<LibraryPhraseResponseType> {
    const pageSize = 3;
    const phraseList: LibraryPhraseType[] = [];
    let moreAvailable = false;
    const phraseListFromDB = await this.phraseRepository.find({
      order: { created_at: 'DESC' },
      where: { user_uuid: user_uuid },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await this.phraseRepository.count({
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
    user_uuid: string,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const pageSize = 3;
    const phraseList: LibraryPhraseTypeV2[] = [];
    const moreAvailable = false;
    const phraseListFromDB = await this.phraseRepository.find({
      order: { created_at: 'DESC' },
      where: { user_uuid: user_uuid },
      take: pageSize,
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
    return {
      library_phrase_list: phraseList,
      more_available: moreAvailable,
    };
  }

  async getAllPhrasesInSpecificPage(
    user_uuid: string,
    page: number,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const pageSize = 7;
    const phraseList: LibraryPhraseTypeV2[] = [];
    let moreAvailable = false;
    const phraseListFromDB = await this.phraseRepository.find({
      order: { created_at: 'DESC' },
      where: { user_uuid: user_uuid },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await this.phraseRepository.count({
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
