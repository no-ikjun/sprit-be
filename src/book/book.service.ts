import { Injectable } from '@nestjs/common';
import { Book } from 'src/global/entities/book.entity';
import { Repository } from 'typeorm';
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
import { InjectRepository } from '@nestjs/typeorm';
import puppeteer from 'puppeteer';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly httpService: HttpService,
    private readonly reviewService: ReviewService,
  ) {}

  async findByISBN(isbn: string): Promise<BookInfoResponseType> {
    let book: Book;
    let star = 0;
    let star_count = 0;
    try {
      book = await this.bookRepository.findOne({
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
      if (book) {
        await this.addScoreToBook(book.book_uuid, 4);
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
      book = await this.bookRepository.findOne({
        where: { book_uuid: book_uuid },
      });
      if (book) {
        star = await this.reviewService.getAverageScoreByBookUuid(book_uuid);
        star_count = await this.reviewService.getReviewCountByBookUuid(
          book_uuid,
        );
      }
      if (book) {
        await this.addScoreToBook(book.book_uuid, 4);
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
      await this.bookRepository.save(bookData);
      await this.addScoreToBook(book_uuid, 5);
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
    await this.bookRepository.save({
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
    if (page > 10) return { books: [], more_available: false };
    const pageSize = 10;
    const bookListWithScore: BookInfoResponseType[] = [];
    let moreAvailable = false;
    const bookList = await this.bookRepository.find({
      order: { score: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await this.bookRepository.count();
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
    return {
      books: bookListWithScore,
      more_available: moreAvailable,
    };
  }

  async addScoreToBook(book_uuid: string, score: number): Promise<void> {
    const book = await this.bookRepository.findOne({
      where: { book_uuid: book_uuid },
    });
    if (!book) {
      return;
    }
    book.score += score;
    await this.bookRepository.save(book);
  }

  async getBestSellerK() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    await page.goto(
      'https://store.kyobobook.co.kr/bestseller/total/weekly?page=1&per=100',
      {
        waitUntil: 'domcontentloaded',
      },
    );

    await page.waitForSelector(
      'a.prod_link.font-weight-medium.line-clamp-2.text-black.hover\\:underline',
      { timeout: 20000 },
    );

    const books = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a.prod_link.font-weight-medium.line-clamp-2.text-black.hover\\:underline',
      );
      return Array.from(elements).map((el, index) => ({
        rank: index + 1,
        title: el.textContent?.trim(),
      }));
    });

    await browser.close();
    return books;
  }

  async getBestSellerY() {
    const browser = await puppeteer.launch({
      headless: true, // 브라우저가 보이지 않게 실행
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
      executablePath: '/usr/bin/chromium-browser',
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    await page.goto(
      'https://www.yes24.com/Product/Category/MonthWeekBestSeller?categoryNumber=001&pageNumber=1&pageSize=100&type=week',
      {
        waitUntil: 'domcontentloaded',
      },
    );

    // 데이터가 로드되기까지 대기
    await page.waitForSelector('a.gd_name', { timeout: 20000 });

    // 데이터 추출
    const books = await page.evaluate(() => {
      const elements = document.querySelectorAll('a.gd_name');
      return Array.from(elements).map((el, index) => ({
        rank: index + 1,
        title: el.textContent?.trim(),
      }));
    });

    await browser.close();
    return books;
  }

  // 일주일 단위 인기 책 점수 초기화
  async weeklyBestSeller() {
    // 점수 계산 함수
    function calculateScore(rank: number) {
      return 101 - rank;
    }

    await this.resetAllScore();

    const booksK = await this.getBestSellerK();
    booksK.forEach((book) => {
      this.setScoreByBookTitle(book.title, calculateScore(book.rank));
    });
    const booksY = await this.getBestSellerY();
    booksY.forEach((book) => {
      this.setScoreByBookTitle(book.title, calculateScore(book.rank));
    });
  }

  // 책 제목 기반 점수 설정
  async setScoreByBookTitle(title: string, score: number) {
    const bookData = await this.searchBook(title, '1');
    if (bookData.books.length === 0) {
      return;
    }
    const book = await this.findByISBN(bookData.books[0].isbn);

    if (book.book_uuid === '') {
      await this.setNewBook({
        isbn: bookData.books[0].isbn,
        title: bookData.books[0].title,
        authors: JSON.stringify(bookData.books[0].authors),
        publisher: bookData.books[0].publisher,
        translators: JSON.stringify(bookData.books[0].translators),
        search_url: bookData.books[0].url,
        thumbnail: bookData.books[0].thumbnail,
        content: bookData.books[0].contents,
        datetime: bookData.books[0].datetime,
      });
    }
    await this.addScoreToBook(book.book_uuid, score);
  }

  // 책 점수 전부 다 0으로 만들기
  async resetAllScore() {
    const books = await this.bookRepository.find();
    books.forEach(async (book) => {
      book.score = 0;
      await this.bookRepository.save(book);
    });
  }
}
