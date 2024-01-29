import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookLibraryService } from './book_library.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Book } from 'src/global/entities/book.entity';
import { RegisterLibraryDto } from './dto/book_library.dto';
import { BookLibrary } from 'src/global/entities/book_library.entity';

@Controller('book-library')
export class BookLibraryController {
  constructor(private readonly bookLibraryService: BookLibraryService) {}

  @Post('register')
  @UseGuards(JwtAccessGuard)
  async setBookLibrary(
    @Req() req,
    @Body() body: RegisterLibraryDto,
  ): Promise<boolean> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.setBookLibrary(access_token, body);
  }

  @Get('find')
  @UseGuards(JwtAccessGuard)
  async getBookLibrary(@Req() req, @Query() query): Promise<BookLibrary> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBookLibraryByBookUuidAndUserUuid(
      access_token,
      query.book_uuid,
    );
  }

  @Get('before')
  @UseGuards(JwtAccessGuard)
  async getBeforeBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBookLibraryList(
      access_token,
      'BEFORE',
    );
  }
  @Get('reading')
  @UseGuards(JwtAccessGuard)
  async getReadingBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBookLibraryList(
      access_token,
      'READING',
    );
  }
  @Get('after')
  @UseGuards(JwtAccessGuard)
  async getAfterBookLibraryList(@Req() req): Promise<Book[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookLibraryService.getBookLibraryList(
      access_token,
      'AFTER',
    );
  }

  @Delete('delete')
  @UseGuards(JwtAccessGuard)
  async deleteBookLibrary(@Req() req, @Query() query): Promise<void> {
    const access_token = req.headers.authorization.split(' ')[1];
    await this.bookLibraryService.deleteBookLibrary(
      access_token,
      query.book_uuid,
    );
  }

  @Patch('update')
  @UseGuards(JwtAccessGuard)
  async updateBookLibrary(@Req() req, @Body() body): Promise<void> {
    const access_token = req.headers.authorization.split(' ')[1];
    await this.bookLibraryService.updateBookLibraryState(
      access_token,
      body.book_uuid,
      body.state,
    );
  }
}
