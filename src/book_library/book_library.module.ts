import { Module } from '@nestjs/common';
import { BookLibraryController } from './book_library.controller';
import { BookLibraryService } from './book_library.service';
import { BookLibraryRepository } from './book_library.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
import { RecordService } from 'src/record/record.service';
import { RecordRepository } from 'src/record/record.repository';
import { Record } from 'src/global/entities/record.entity';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { ArticleService } from 'src/article/article.service';
import { FollowService } from 'src/follow/follow.service';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileRepository } from 'src/profile/profile.repository';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      BookLibrary,
      Book,
      User,
      Review,
      Record,
      Article,
      ArticleLike,
      Follow,
      Profile,
      ProfileRecommendBook,
    ]),
  ],
  controllers: [BookLibraryController],
  providers: [
    BookLibraryService,
    BookLibraryRepository,
    BookService,
    ReviewService,
    UserService,
    UserRepository,
    RecordService,
    RecordRepository,
    ArticleService,
    FollowService,
    ProfileService,
    ProfileRepository,
  ],
})
export class BookLibraryModule {}
