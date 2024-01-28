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
import { BookReportService } from './book_report.service';
import { NewBookReportDto, UpdateBookReportDto } from './dto/book_report.dto';
import { BookReport } from 'src/global/entities/book_report.entity';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';

@Controller('book-report')
export class BookReportController {
  constructor(private readonly bookReportService: BookReportService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setBookReport(
    @Req() req,
    @Body() body: NewBookReportDto,
  ): Promise<void> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookReportService.setBookReport(access_token, body);
  }

  @Get('user')
  @UseGuards(JwtAccessGuard)
  async getBookReportByUserUuid(@Req() req): Promise<string[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookReportService.getBookReportByUserUuid(access_token);
  }

  @Get('user/book')
  @UseGuards(JwtAccessGuard)
  async getBookReportByBookUuid(
    @Req() req,
    @Query() query,
  ): Promise<BookReport> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.bookReportService.getBookReportByBookUuidAndUserUuid(
      access_token,
      query.book_uuid,
    );
  }

  @Patch()
  @UseGuards(JwtAccessGuard)
  async updateBookReport(@Body() body: UpdateBookReportDto): Promise<void> {
    return await this.bookReportService.updateBookReport(body);
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteBookReport(@Query() query): Promise<void> {
    await this.bookReportService.deleteBookReport(query.book_report_uuid);
  }
}
