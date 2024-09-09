import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { HttpModule } from '@nestjs/axios';
import { RecordRepository } from './record.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { BookService } from 'src/book/book.service';
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
    TypeOrmModule.forFeature([Book, BookLibrary, Record, User, Review]),
  ],
  controllers: [RecordController],
  providers: [
    RecordService,
    RecordRepository,
    UserService,
    UserRepository,
    BookService,
    ReviewService,
  ],
})
export class RecordModule {}
