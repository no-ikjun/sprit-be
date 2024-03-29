import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PhraseRepository } from './phrase.repository';
import { UserService } from 'src/user/user.service';
import { NewPhraseDto } from './dto/phrase.dto';
import { Phrase } from 'src/global/entities/phrase.entity';
import {
  LibraryPhraseResponseType,
  LibraryPhraseResponseTypeV2,
} from 'src/global/types/response.type';

@Injectable()
export class PhraseService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly phraseRepository: PhraseRepository,
    private readonly userService: UserService,
  ) {}

  async setPhrase(data: NewPhraseDto, access_token: string): Promise<string> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const user_info = await this.userService.getUserInfo(access_token);
        return await this.phraseRepository.setPhrase(
          transactionEntityManager,
          data.book_uuid,
          user_info.user_uuid,
          data.phrase,
          data.page,
          data.remind,
        );
      },
    );
  }

  async getPhrasesByUserUuid(access_token: string): Promise<Phrase[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getPhrasesByUserUuid(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async getPhraseByPhraseUuid(phrase_uuid: string): Promise<Phrase> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getPhraseByPhraseUuid(
          transactionEntityManager,
          phrase_uuid,
        );
      },
    );
  }

  async updatePhraseRemind(
    phrase_uuid: string,
    remind: boolean,
  ): Promise<void> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        await this.phraseRepository.updatePhraseRemind(
          transactionEntityManager,
          phrase_uuid,
          remind,
        );
      },
    );
  }

  async updatePhrase(phrase_uuid: string, phrase: string): Promise<void> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        await this.phraseRepository.updatePhrase(
          transactionEntityManager,
          phrase_uuid,
          phrase,
        );
      },
    );
  }

  async getRemindPhrase(access_token: string): Promise<Phrase[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getRemindPhrase(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async deletePhrase(phrase_uuid: string): Promise<void> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        await this.phraseRepository.deletePhrase(
          transactionEntityManager,
          phrase_uuid,
        );
      },
    );
  }

  async getPhrasesForLibrary(
    access_token: string,
    page: number,
  ): Promise<LibraryPhraseResponseType> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getPhrasesForLibrary(
          transactionEntityManager,
          user_info.user_uuid,
          page,
        );
      },
    );
  }

  async getPhrasesForLibraryScreen(
    access_token: string,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getPhrasesForLibraryV2(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async getPhrasesForLibraryV2(
    access_token: string,
    page: number,
  ): Promise<LibraryPhraseResponseType> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.phraseRepository.getAllPhrasesInSpecificPage(
          transactionEntityManager,
          user_info.user_uuid,
          page,
        );
      },
    );
  }
}
