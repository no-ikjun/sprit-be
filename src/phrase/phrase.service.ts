import { Injectable } from '@nestjs/common';
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
    private readonly phraseRepository: PhraseRepository,
    private readonly userService: UserService,
  ) {}

  async setPhrase(data: NewPhraseDto, access_token: string): Promise<string> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.setPhrase(
      data.book_uuid,
      user_info.user_uuid,
      data.phrase,
      data.page,
      data.remind,
    );
  }

  async getPhrasesByUserUuid(access_token: string): Promise<Phrase[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.getPhrasesByUserUuid(
      user_info.user_uuid,
    );
  }

  async getPhraseByPhraseUuid(phrase_uuid: string): Promise<Phrase> {
    return await this.phraseRepository.getPhraseByPhraseUuid(phrase_uuid);
  }

  async updatePhraseRemind(
    phrase_uuid: string,
    remind: boolean,
  ): Promise<void> {
    return await this.phraseRepository.updatePhraseRemind(phrase_uuid, remind);
  }

  async updatePhrase(phrase_uuid: string, phrase: string): Promise<void> {
    return await this.phraseRepository.updatePhrase(phrase_uuid, phrase);
  }

  async getRemindPhrase(access_token: string): Promise<Phrase[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.getRemindPhrase(user_info.user_uuid);
  }

  async deletePhrase(phrase_uuid: string): Promise<void> {
    return await this.phraseRepository.deletePhrase(phrase_uuid);
  }

  async getPhrasesForLibrary(
    access_token: string,
    page: number,
  ): Promise<LibraryPhraseResponseType> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.getPhrasesForLibrary(
      user_info.user_uuid,
      page,
    );
  }

  async getPhrasesForLibraryScreen(
    access_token: string,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.getPhrasesForLibraryV2(
      user_info.user_uuid,
    );
  }

  async getPhrasesForLibraryV2(
    access_token: string,
    page: number,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.phraseRepository.getAllPhrasesInSpecificPage(
      user_info.user_uuid,
      page,
    );
  }
}
