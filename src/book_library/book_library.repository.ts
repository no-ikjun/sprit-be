import { Injectable } from '@nestjs/common';
import { Book } from 'src/global/entities/book.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class BookLibraryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getBookLibraryListByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    state: string,
  ): Promise<Book[]> {
    const library_info = await transactionEntityManager.find(BookLibrary, {
      where: { user_uuid: user_uuid, state: state },
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
}
