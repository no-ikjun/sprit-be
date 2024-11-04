import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { FollowService } from 'src/follow/follow.service';
import { Follow } from 'src/global/entities/follow.entity';
import { User } from 'src/global/entities/user.entity';
import { ProfileRepository } from 'src/profile/profile.repository';
import { BookService } from 'src/book/book.service';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { Book } from 'src/global/entities/book.entity';
import { HttpModule } from '@nestjs/axios';
import { Review } from 'src/global/entities/review.entity';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleLike,
      Follow,
      User,
      Profile,
      ProfileRecommendBook,
      Book,
      Review,
    ]),
    HttpModule,
  ],
  providers: [
    ArticleService,
    FollowService,
    ProfileRepository,
    BookService,
    ReviewService,
    UserService,
    UserRepository,
  ],
  controllers: [ArticleController],
})
export class ArticleModule {}
