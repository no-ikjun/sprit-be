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
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookReportRepository.setBookReport(
          transactionEntityManager,
          data.book_uuid,
          user_info.user_uuid,
          data.report,
        );
      },
    );
  }

  async getBookReportByBookReportUuid(
    book_report_uuid: string,
  ): Promise<BookReport> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const book_report =
          await this.bookReportRepository.getBookReportByBookReportUuid(
            transactionEntityManager,
            book_report_uuid,
          );
        return book_report;
      },
    );
  }

  async getBookReportByUserUuid(access_token: string): Promise<string[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const book_report_list =
          await this.bookReportRepository.getBookReportByUserUuid(
            transactionEntityManager,
            user_info.user_uuid,
          );
        return book_report_list.map((book_report) => book_report.book_uuid);
      },
    );
  }

  async getBookReportByBookUuid(book_uuid: string): Promise<string[]> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const book_report_list =
          await this.bookReportRepository.getBookReportByBookUuid(
            transactionEntityManager,
            book_uuid,
          );
        return book_report_list.map((book_report) => book_report.book_uuid);
      },
    );
  }

  async getBookReportByBookUuidAndUserUuid(
    access_token: string,
    book_uuid: string,
  ): Promise<BookReport> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const book_report =
          await this.bookReportRepository.getBookReportByBookUuidAndUserUuid(
            transactionEntityManager,
            book_uuid,
            user_info.user_uuid,
          );
        return book_report;
      },
    );
  }

  async updateBookReport(data: UpdateBookReportDto): Promise<void> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookReportRepository.updateBookReport(
          transactionEntityManager,
          data.book_report_uuid,
          data.report,
        );
      },
    );
  }

  async deleteBookReport(book_report_uuid: string): Promise<void> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookReportRepository.deleteBookReport(
          transactionEntityManager,
          book_report_uuid,
        );
      },
    );
  }
}
