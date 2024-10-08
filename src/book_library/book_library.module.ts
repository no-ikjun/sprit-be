import { Module } from '@nestjs/common';
import { BookLibraryController } from './book_library.controller';
import { BookLibraryService } from './book_library.service';
import { BookLibraryRepository } from './book_library.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { RecordRepository } from 'src/record/record.repository';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { Record } from 'src/global/entities/record.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Book, Record, BookLibrary, User, Review]),
  ],
  controllers: [BookLibraryController],
  providers: [
    BookLibraryService,
    BookLibraryRepository,
    UserService,
    UserRepository,
    RecordRepository,
    BookService,
    ReviewService,
  ],
})
export class BookLibraryModule {}
