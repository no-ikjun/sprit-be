import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
import { Article } from 'src/global/entities/article.entity';
import { ArticleService } from 'src/article/article.service';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, User, Article, ArticleLike, Follow]),
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    UserService,
    UserRepository,
    ArticleService,
    FollowService,
  ],
})
export class ReviewModule {}
