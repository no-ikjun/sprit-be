import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/book.service';
import { BookReport } from 'src/global/entities/book_report.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class BookReportRepository {
  constructor(
    private readonly bookService: BookService,
    @InjectRepository(BookReport)
    private readonly bookReportRepository: Repository<BookReport>,
  ) {}

  async setBookReport(
    book_uuid: string,
    user_uuid: string,
    report: string,
  ): Promise<void> {
    const book_report_uuid = generateRamdomId(
      'BR' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.bookReportRepository.save({
      book_report_uuid: book_report_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      report: report,
      created_at: new Date(),
    });
    await this.bookService.addScoreToBook(book_uuid, 3);
  }

  async getBookReportByBookReportUuid(
    book_report_uuid: string,
  ): Promise<BookReport> {
    return await this.bookReportRepository.findOne({
      where: { book_report_uuid: book_report_uuid },
    });
  }

  async getBookReportByUserUuid(user_uuid: string): Promise<BookReport[]> {
    return await this.bookReportRepository.find({
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getBookReportByBookUuid(book_uuid: string): Promise<BookReport[]> {
    return await this.bookReportRepository.find({
      where: { book_uuid: book_uuid },
    });
  }

  async getBookReportByBookUuidAndUserUuid(
    book_uuid: string,
    user_uuid: string,
  ): Promise<BookReport> {
    return await this.bookReportRepository.findOne({
      where: { book_uuid: book_uuid, user_uuid: user_uuid },
    });
  }

  async updateBookReport(
    book_report_uuid: string,
    report: string,
  ): Promise<void> {
    await this.bookReportRepository.update(
      { book_report_uuid: book_report_uuid },
      { report: report },
    );
  }

  async deleteBookReport(book_report_uuid: string): Promise<void> {
    await this.bookReportRepository.delete({
      book_report_uuid: book_report_uuid,
    });
  }
}
