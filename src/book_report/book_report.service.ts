import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookReportRepository } from './book_report.repository';
import { UserService } from 'src/user/user.service';
import { NewBookReportDto, UpdateBookReportDto } from './dto/book_report.dto';
import { BookReport } from 'src/global/entities/book_report.entity';

@Injectable()
export class BookReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookReportRepository: BookReportRepository,
    private readonly userService: UserService,
  ) {}

  async setBookReport(
    access_token: string,
    data: NewBookReportDto,
  ): Promise<void> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.bookReportRepository.setBookReport(
      data.book_uuid,
      user_info.user_uuid,
      data.report,
    );
  }

  async getBookReportByBookReportUuid(
    book_report_uuid: string,
  ): Promise<BookReport> {
    return await this.bookReportRepository.getBookReportByBookReportUuid(
      book_report_uuid,
    );
  }

  async getBookReportByUserUuid(access_token: string): Promise<BookReport[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.bookReportRepository.getBookReportByUserUuid(
      user_info.user_uuid,
    );
  }

  async getBookReportByBookUuid(book_uuid: string): Promise<BookReport[]> {
    return await this.bookReportRepository.getBookReportByBookUuid(book_uuid);
  }

  async getBookReportByBookUuidAndUserUuid(
    access_token: string,
    book_uuid: string,
  ): Promise<BookReport> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.bookReportRepository.getBookReportByBookUuidAndUserUuid(
      book_uuid,
      user_info.user_uuid,
    );
  }

  async updateBookReport(data: UpdateBookReportDto): Promise<void> {
    return await this.bookReportRepository.updateBookReport(
      data.book_report_uuid,
      data.report,
    );
  }

  async deleteBookReport(book_report_uuid: string): Promise<void> {
    return await this.bookReportRepository.deleteBookReport(book_report_uuid);
  }
}
