import { Module } from '@nestjs/common';
import { BookReportController } from './book_report.controller';
import { BookReportService } from './book_report.service';
import { BookReportRepository } from './book_report.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { BookReport } from 'src/global/entities/book_report.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Book, BookReport, User, Review]),
  ],
  controllers: [BookReportController],
  providers: [
    BookReportService,
    BookReportRepository,
    UserService,
    UserRepository,
    BookService,
    ReviewService,
  ],
})
export class BookReportModule {}
