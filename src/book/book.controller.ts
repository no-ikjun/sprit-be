import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import {
  BookInfoResponseType,
  BookRegisterResponseType,
  BookSearchResponseType,
  PopularBookResponseType,
} from 'src/global/types/response.type';

@Controller('v1/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('/register')
  @UseGuards(JwtAccessGuard)
  async registerBook(@Query() query): Promise<BookRegisterResponseType> {
    return await this.bookService.setNewBookByISBN(query.isbn);
  }

  @Get('/search')
  @UseGuards(JwtAccessGuard)
  async searchBook(@Query() query): Promise<BookSearchResponseType> {
    return await this.bookService.searchBook(query.query, query.page ?? '1');
  }

  @Get('/find/uuid')
  @UseGuards(JwtAccessGuard)
  async getBookInfo(@Query() query): Promise<BookInfoResponseType> {
    return await this.bookService.findByBookUuid(query.book_uuid);
  }

  @Get('/find/isbn')
  @UseGuards(JwtAccessGuard)
  async getBookInfoByISBN(@Query() query): Promise<BookInfoResponseType> {
    return await this.bookService.findByISBN(query.isbn);
  }

  @Get('/popular')
  @UseGuards(JwtAccessGuard)
  async getPopularBook(@Query() query): Promise<PopularBookResponseType> {
    return await this.bookService.getPopularBookList(query.page ?? 1);
  }

  @Get('best')
  @UseGuards(JwtAccessGuard)
  async getBestBook() {
    await this.bookService.weeklyBestSeller();
    return { message: 'success' };
  }
}
