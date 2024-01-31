import { Injectable } from '@nestjs/common';
import { BookService } from 'src/book/book.service';
import { Book } from 'src/global/entities/book.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import {
  BookLibraryListResponseType,
  BookLibraryResponseType,
  BookMarkResponseType,
  BookMarkType,
} from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { RecordRepository } from 'src/record/record.repository';
import { DataSource, EntityManager, In } from 'typeorm';

@Injectable()
export class BookLibraryRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly recordRepository: RecordRepository,
    private readonly bookService: BookService,
  ) {}

  async getBookLibraryListWithStateList(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    state_list: string[],
    page: number,
  ): Promise<BookLibraryListResponseType> {
    const libraryList: BookLibraryResponseType[] = [];
    let moreAvailable = false;
    const pageSize = 3;
    const bookLibraryList = await transactionEntityManager.find(BookLibrary, {
      where: { user_uuid: user_uuid, state: In(state_list) },
      order: { updated_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await transactionEntityManager.count(BookLibrary, {
      where: { user_uuid: user_uuid, state: In(state_list) },
    });
    moreAvailable = totalCount > page * pageSize;
    for (const bookLibrary of bookLibraryList) {
      const count =
        await this.recordRepository.getRecordCountByBookUuidandUserUuid(
          transactionEntityManager,
          bookLibrary.book_uuid,
          user_uuid,
        );
      libraryList.push({
        book_uuid: bookLibrary.book_uuid,
        state: bookLibrary.state,
        count: count,
      });
    }
    return { book_library_list: libraryList, more_available: moreAvailable };
  }

  async getBookLibraryListByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    state: string,
  ): Promise<Book[]> {
    const library_info = await transactionEntityManager.find(BookLibrary, {
      where: { user_uuid: user_uuid, state: state },
      order: { created_at: 'DESC' },
    });
    const book_uuid_list = library_info.map((book) => book.book_uuid);
    const book_list = [];
    for (let i = 0; i < book_uuid_list.length; i++) {
      const book = await transactionEntityManager.findOne(Book, {
        where: { book_uuid: book_uuid_list[i] },
      });
      book_list.push(book);
    }
    return book_list;
  }

  async setBookLibrary(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    book_uuid: string,
    state: string,
  ): Promise<boolean> {
    const already_book = await transactionEntityManager.findOne(BookLibrary, {
      where: { user_uuid: user_uuid, book_uuid: book_uuid },
    });
    if (already_book) {
      return false;
    }
    const library_register_uuid = generateRamdomId(
      'LB' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save(BookLibrary, {
      library_register_uuid: library_register_uuid,
      user_uuid: user_uuid,
      book_uuid: book_uuid,
      state: state,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return true;
  }

  async deleteBookLibrary(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    book_uuid: string,
  ): Promise<void> {
    await transactionEntityManager.delete(BookLibrary, {
      user_uuid: user_uuid,
      book_uuid: book_uuid,
    });
  }

  async updateBookLibrary(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    book_uuid: string,
    state: string,
  ): Promise<void> {
    await transactionEntityManager.update(
      BookLibrary,
      { user_uuid: user_uuid, book_uuid: book_uuid },
      { state: state },
    );
  }

  async getBookLibraryByBookUuidAndUserUuid(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
  ): Promise<BookLibrary> {
    return await transactionEntityManager.findOne(BookLibrary, {
      where: { book_uuid: book_uuid, user_uuid: user_uuid },
    });
  }

  async getBookMark(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    page: number,
  ): Promise<BookMarkResponseType> {
    const pageSize = 3;
    const bookMarkList: BookMarkType[] = [];
    let moreAvailable = false;
    const bookLibraryList = await transactionEntityManager.find(BookLibrary, {
      order: { updated_at: 'DESC' },
      where: { user_uuid: user_uuid, state: 'READING' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await transactionEntityManager.count(BookLibrary, {
      where: { user_uuid: user_uuid, state: 'READING' },
    });
    moreAvailable = totalCount > page * pageSize;
    for (const bookLibrary of bookLibraryList) {
      const bookInfo = await this.bookService.findByBookUuid(
        bookLibrary.book_uuid,
      );
      const lastPage = await this.recordRepository.getLastPage(
        transactionEntityManager,
        user_uuid,
        bookLibrary.book_uuid,
        true,
      );
      bookMarkList.push({
        book_uuid: bookInfo.book_uuid,
        thumbnail: bookInfo.thumbnail,
        last_page: lastPage,
      });
    }
    return {
      book_marks: bookMarkList,
      more_available: moreAvailable,
    };
  }
}
