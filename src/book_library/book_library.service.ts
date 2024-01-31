import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookLibraryRepository } from './book_library.repository';
import { UserService } from 'src/user/user.service';
import { Book } from 'src/global/entities/book.entity';
import { RegisterLibraryDto } from './dto/book_library.dto';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import {
  BookLibraryResponseType,
  BookMarkResponseType,
} from 'src/global/types/response.type';

@Injectable()
export class BookLibraryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookLibraryRepository: BookLibraryRepository,
    private readonly userService: UserService,
  ) {}

  async getBookLibraryList(
    access_token: string,
    state: string,
  ): Promise<Book[]> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.getBookLibraryListByUserUuid(
          transactionEntityManager,
          userInfo.user_uuid,
          state,
        );
      },
    );
  }

  async getBookLibraryListWithStateList(
    access_token: string,
    state_list: string[],
    page: number,
  ): Promise<BookLibraryResponseType[]> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.getBookLibraryListWithStateList(
          transactionEntityManager,
          userInfo.user_uuid,
          state_list,
          page,
        );
      },
    );
  }

  async setBookLibrary(
    access_token: string,
    book_info: RegisterLibraryDto,
  ): Promise<boolean> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.setBookLibrary(
          transactionEntityManager,
          userInfo.user_uuid,
          book_info.book_uuid,
          book_info.state,
        );
      },
    );
  }

  async deleteBookLibrary(
    access_token: string,
    book_uuid: string,
  ): Promise<void> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.deleteBookLibrary(
          transactionEntityManager,
          userInfo.user_uuid,
          book_uuid,
        );
      },
    );
  }

  async updateBookLibraryState(
    access_token: string,
    book_uuid: string,
    state: string,
  ): Promise<void> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.updateBookLibrary(
          transactionEntityManager,
          userInfo.user_uuid,
          book_uuid,
          state,
        );
      },
    );
  }

  async getBookLibraryByBookUuidAndUserUuid(
    access_token: string,
    book_uuid: string,
  ): Promise<BookLibrary> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.getBookLibraryByBookUuidAndUserUuid(
          transactionEntityManager,
          book_uuid,
          userInfo.user_uuid,
        );
      },
    );
  }

  async getBookMark(
    access_token: string,
    page: number,
  ): Promise<BookMarkResponseType> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.getBookMark(
          transactionEntityManager,
          userInfo.user_uuid,
          page,
        );
      },
    );
  }
}
