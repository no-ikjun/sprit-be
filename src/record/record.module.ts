import { forwardRef, Module } from '@nestjs/common';
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
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
import { Article } from 'src/global/entities/article.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ArticleService } from 'src/article/article.service';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';
import { ProfileModule } from 'src/profile/profile.module';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { BookLibraryService } from 'src/book_library/book_library.service';
import { BookLibraryRepository } from 'src/book_library/book_library.repository';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Record,
      Book,
      Review,
      User,
      Article,
      ArticleLike,
      Follow,
      Profile,
      ProfileRecommendBook,
      BookLibrary,
    ]),
    forwardRef(() => ProfileModule),
  ],
  controllers: [RecordController],
  providers: [
    RecordService,
    RecordRepository,
    BookService,
    ReviewService,
    UserService,
    UserRepository,
    ArticleService,
    FollowService,
    BookLibraryService,
    BookLibraryRepository,
  ],
  exports: [RecordService, RecordRepository],
})
export class RecordModule {}
