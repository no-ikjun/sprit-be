import { Injectable } from '@nestjs/common';
import { BookReport } from 'src/global/entities/book_report.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class BookReportRepository {
  constructor(private readonly dataSource: DataSource) {}

  async setBookReport(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
    report: string,
  ): Promise<void> {
    const book_report_uuid = generateRamdomId(
      'BR' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save(BookReport, {
      book_report_uuid: book_report_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      report: report,
      created_at: new Date(),
    });
  }

  async getBookReportByBookReportUuid(
    transactionEntityManager: EntityManager,
    book_report_uuid: string,
  ): Promise<BookReport> {
    return await transactionEntityManager.findOne(BookReport, {
      where: { book_report_uuid: book_report_uuid },
    });
  }

  async getBookReportByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<BookReport[]> {
    return await transactionEntityManager.find(BookReport, {
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getBookReportByBookUuid(
    transactionEntityManager: EntityManager,
    book_uuid: string,
  ): Promise<BookReport[]> {
    return await transactionEntityManager.find(BookReport, {
      where: { book_uuid: book_uuid },
    });
  }

  async getBookReportByBookUuidAndUserUuid(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
  ): Promise<BookReport> {
    return await transactionEntityManager.findOne(BookReport, {
      where: { book_uuid: book_uuid, user_uuid: user_uuid },
    });
  }

  async updateBookReport(
    transactionEntityManager: EntityManager,
    book_report_uuid: string,
    report: string,
  ): Promise<void> {
    await transactionEntityManager.update(
      BookReport,
      { book_report_uuid: book_report_uuid },
      { report: report },
    );
  }

  async deleteBookReport(
    transactionEntityManager: EntityManager,
    book_report_uuid: string,
  ): Promise<void> {
    await transactionEntityManager.delete(BookReport, {
      book_report_uuid: book_report_uuid,
    });
  }
}
