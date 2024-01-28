import { Module } from '@nestjs/common';
import { BookReportController } from './book_report.controller';
import { BookReportService } from './book_report.service';
import { BookReportRepository } from './book_report.repository';

@Module({
  controllers: [BookReportController],
  providers: [BookReportService, BookReportRepository],
})
export class BookReportModule {}
