import { Injectable } from '@nestjs/common';
import { Book } from 'src/global/entities/book.entity';
import { DataSource } from 'typeorm';
import { BookInfoDto, NewBookDto } from './dto/book.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  BookRegisterResponseType,
  BookSearchResponseType,
  PopularBookResponseType,
} from 'src/global/types/response.type';

@Injectable()
export class BookService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  async findByISBN(isbn: string): Promise<Book> {
    let book: Book;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      book = await transctionEntityManager.findOne(Book, {
        where: { isbn: isbn },
      });
    });
    return book;
  }

  async findByBookUuid(book_uuid: string): Promise<Book> {
    let book: Book;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      book = await transctionEntityManager.findOne(Book, {
        where: { book_uuid: book_uuid },
      });
    });
    return book;
  }

  async setNewBookByISBN(isbn: string): Promise<BookRegisterResponseType> {
    const book_uuid = generateRamdomId(
      'BO' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    const headersRequest = {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    };
    const response$ = this.httpService.get(
      `https://dapi.kakao.com/v3/search/book?query=${isbn}`,
      { headers: headersRequest },
    );
    const response = await firstValueFrom(response$);
    const books = response.data.documents;
    const book = books[0];
    const existingBook = await this.findByISBN(book.isbn);
    if (existingBook) {
      return { new_book: false, book_data: existingBook };
    }
    const bookData = new Book();
    bookData.book_uuid = book_uuid;
    bookData.isbn = book.isbn;
    bookData.title = book.title;
    bookData.authors = JSON.stringify(book.authors);
    bookData.publisher = book.publisher;
    bookData.translators = JSON.stringify(book.translators);
    bookData.search_url = book.url;
    bookData.thumbnail = book.thumbnail;
    bookData.content = book.contents;
    bookData.published_at = new Date(book.datetime);
    bookData.updated_at = new Date();
    bookData.score = 0;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      await transctionEntityManager.save(Book, bookData);
    });
    return { new_book: true, book_data: bookData };
  }

  async setNewBook(bookData: NewBookDto): Promise<void> {
    const book_uuid = generateRamdomId(
      'BN' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.dataSource.transaction(async (transctionEntityManager) => {
      await transctionEntityManager.save(Book, {
        book_uuid: book_uuid,
        isbn: bookData.isbn,
        title: bookData.title,
        authors: bookData.authors,
        publisher: bookData.publisher,
        translators: bookData.translators,
        search_url: bookData.search_url,
        thumbnail: bookData.thumbnail,
        content: bookData.content,
        published_at: new Date(bookData.datetime),
        updated_at: new Date(),
        score: 0,
      });
    });
  }

  async searchBook(
    query: string,
    page: string,
  ): Promise<BookSearchResponseType> {
    const headersRequest = {
      Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    };
    const response$ = this.httpService.get(
      `https://dapi.kakao.com/v3/search/book?query=${query}&page=${page}`,
      { headers: headersRequest },
    );
    const response = await firstValueFrom(response$);
    const books = response.data.documents;
    return {
      is_end: response.data.meta.is_end,
      books: books.map((book: any) => new BookInfoDto(book)),
    };
  }

  async getPopularBookList(page: number): Promise<PopularBookResponseType> {
    const pageSize = 10;
    let bookList: Book[];
    let moreAvailable = false;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      bookList = await transctionEntityManager.find(Book, {
        order: { score: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      const totalCount = await transctionEntityManager.count(Book);
      moreAvailable = totalCount > page * pageSize;
    });
    return { books: bookList, more_available: moreAvailable };
  }
}
