import { Module } from '@nestjs/common';
import { PhraseController } from './phrase.controller';
import { PhraseService } from './phrase.service';
import { PhraseRepository } from './phrase.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { HttpModule } from '@nestjs/axios';
import { BookService } from 'src/book/book.service';
import { ReviewService } from 'src/review/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { Phrase } from 'src/global/entities/phrase.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Book, BookLibrary, Phrase, User, Review]),
  ],
  controllers: [PhraseController],
  providers: [
    PhraseService,
    PhraseRepository,
    UserService,
    UserRepository,
    BookService,
    ReviewService,
  ],
})
export class PhraseModule {}
