import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BookLibraryService } from './book_library.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Book } from 'src/global/entities/book.entity';

@Controller('book-library')
export class BookLibraryController {
  constructor(private readonly bookLibraryService: BookLibraryService) {}

  @Post('register')
  @UseGuards(JwtAccessGuard)
  async setBookLibrary(@Req() req): Promise<void> {
    const access_token = req.headers.authorization.split(' ')[1];
    await this.bookLibraryService.setBookLibrary(access_token, req.body);
  }

  @Get('before')
  @UseGuards(JwtAccessGuard)
  async getBeforeBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBeforeBookLibraryList(
      access_token,
      'BEFORE',
    );
  }
  @Get('reading')
  @UseGuards(JwtAccessGuard)
  async getReadingBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBeforeBookLibraryList(
      access_token,
      'READING',
    );
  }
  @Get('after')
  @UseGuards(JwtAccessGuard)
  async getAfterBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBeforeBookLibraryList(
      access_token,
      'AFTER',
    );
  }
}
