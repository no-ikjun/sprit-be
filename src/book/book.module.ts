import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';
import { Article } from 'src/global/entities/article.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ArticleService } from 'src/article/article.service';
import { FollowService } from 'src/follow/follow.service';
import { Follow } from 'src/global/entities/follow.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Book,
      Review,
      User,
      Article,
      ArticleLike,
      Follow,
      Profile,
      ProfileRecommendBook,
    ]),
  ],
  providers: [
    BookService,
    ReviewService,
    UserService,
    UserRepository,
    ArticleService,
    FollowService,
    ProfileService,
  ],
  controllers: [BookController],
})
export class BookModule {}
