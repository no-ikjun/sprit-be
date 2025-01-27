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
import { ProfileService } from 'src/profile/profile.service';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';
import { BookModule } from 'src/book/book.module';
import { UserModule } from 'src/user/user.module';
import { ArticleModule } from 'src/article/article.module';
import { FollowModule } from 'src/follow/follow.module';
import { ProfileModule } from 'src/profile/profile.module';

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
    ]),
    forwardRef(() => BookModule),
    forwardRef(() => UserModule),
    forwardRef(() => ArticleModule),
    forwardRef(() => FollowModule),
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
    ProfileService,
    ProfileRepository,
  ],
})
export class RecordModule {}
