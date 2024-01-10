import { Injectable } from '@nestjs/common';
import { Book } from 'src/global/entities/book.entity';
import { DataSource } from 'typeorm';
import { BookInfoDto, NewBookDto } from './dto/book.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  BookInfoResponseType,
  BookRegisterResponseType,
  BookSearchResponseType,
  PopularBookResponseType,
} from 'src/global/types/response.type';
import { ReviewService } from 'src/review/review.service';

@Injectable()
export class BookService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly reviewService: ReviewService,
  ) {}

  async findByISBN(isbn: string): Promise<BookInfoResponseType> {
    let book: Book;
    let star = 0;
    let star_count = 0;
    try {
      await this.dataSource.transaction(async (transctionEntityManager) => {
        book = await transctionEntityManager.findOne(Book, {
          where: { isbn: isbn },
        });
        if (book) {
          star = await this.reviewService.getAverageScoreByBookUuid(
            book.book_uuid,
          );
          star_count = await this.reviewService.getReviewCountByBookUuid(
            book.book_uuid,
          );
        }
      });
      if (book) {
        return {
          book_uuid: book.book_uuid,
          isbn: book.isbn,
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          translators: book.translators,
          search_url: book.search_url,
          thumbnail: book.thumbnail,
          content: book.content,
          published_at: book.published_at,
          updated_at: book.updated_at,
          score: book.score,
          star: star,
          star_count: star_count,
        };
      } else {
        return {
          book_uuid: '',
          isbn: '',
          title: '',
          authors: '',
          publisher: '',
          translators: '',
          search_url: '',
          thumbnail: '',
          content: '',
          published_at: new Date(),
          updated_at: new Date(),
          score: 0,
          star: 0,
          star_count: 0,
        };
      }
    } catch (e) {
      return {
        book_uuid: '',
        isbn: '',
        title: '',
        authors: '',
        publisher: '',
        translators: '',
        search_url: '',
        thumbnail: '',
        content: '',
        published_at: new Date(),
        updated_at: new Date(),
        score: 0,
        star: 0,
        star_count: 0,
      };
    }
  }

  async findByBookUuid(book_uuid: string): Promise<BookInfoResponseType> {
    let book: Book;
    let star = 0;
    let star_count = 0;
    try {
      await this.dataSource.transaction(async (transctionEntityManager) => {
        book = await transctionEntityManager.findOne(Book, {
          where: { book_uuid: book_uuid },
        });
        if (book) {
          star = await this.reviewService.getAverageScoreByBookUuid(book_uuid);
          star_count = await this.reviewService.getReviewCountByBookUuid(
            book_uuid,
          );
        }
      });
      if (book) {
        return {
          book_uuid: book.book_uuid,
          isbn: book.isbn,
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          translators: book.translators,
          search_url: book.search_url,
          thumbnail: book.thumbnail,
          content: book.content,
          published_at: book.published_at,
          updated_at: book.updated_at,
          score: book.score,
          star: star,
          star_count: star_count,
        };
      } else {
        return {
          book_uuid: '',
          isbn: '',
          title: '',
          authors: '',
          publisher: '',
          translators: '',
          search_url: '',
          thumbnail: '',
          content: '',
          published_at: new Date(),
          updated_at: new Date(),
          score: 0,
          star: 0,
          star_count: 0,
        };
      }
    } catch (e) {
      return {
        book_uuid: '',
        isbn: '',
        title: '',
        authors: '',
        publisher: '',
        translators: '',
        search_url: '',
        thumbnail: '',
        content: '',
        published_at: new Date(),
        updated_at: new Date(),
        score: 0,
        star: 0,
        star_count: 0,
      };
    }
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
    try {
      await this.dataSource.transaction(async (transactionEntityManager) => {
        await transactionEntityManager.save(Book, bookData);
      });
      return { new_book: true, book_data: bookData };
    } catch (error) {
      console.error('Error when saving new book:', error);
      throw error;
    }
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
    const bookListWithScore: BookInfoResponseType[] = [];
    let moreAvailable = false;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      bookList = await transctionEntityManager.find(Book, {
        order: { score: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      const totalCount = await transctionEntityManager.count(Book);
      moreAvailable = totalCount > page * pageSize;
      for (const book of bookList) {
        const star = await this.reviewService.getAverageScoreByBookUuid(
          book.book_uuid,
        );
        const star_count = await this.reviewService.getReviewCountByBookUuid(
          book.book_uuid,
        );
        bookListWithScore.push({
          book_uuid: book.book_uuid,
          isbn: book.isbn,
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          translators: book.translators,
          search_url: book.search_url,
          thumbnail: book.thumbnail,
          content: book.content,
          published_at: book.published_at,
          updated_at: book.updated_at,
          score: book.score,
          star: star,
          star_count: star_count,
        });
      }
    });
    return {
      books: bookListWithScore,
      more_available: moreAvailable,
    };
  }
}
