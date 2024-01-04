import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { BookInfoDto } from './dto/book.dto';
import { BookRegisterResponseType } from 'src/global/types/response.type';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('/register')
  @UseGuards(JwtAccessGuard)
  async registerBook(@Query() query): Promise<BookRegisterResponseType> {
    return await this.bookService.setNewBookByISBN(query.isbn);
  }

  @Get('/search')
  @UseGuards(JwtAccessGuard)
  async searchBook(@Query() query): Promise<BookInfoDto[]> {
    return await this.bookService.searchBook(query.query, query.page ?? '1');
  }
}
