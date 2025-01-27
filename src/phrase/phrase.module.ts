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
import { Article } from 'src/global/entities/article.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ArticleService } from 'src/article/article.service';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileRepository } from 'src/profile/profile.repository';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Book,
      BookLibrary,
      Phrase,
      User,
      Review,
      Article,
      ArticleLike,
      Profile,
      ProfileRecommendBook,
      Follow,
    ]),
  ],
  controllers: [PhraseController],
  providers: [
    PhraseService,
    PhraseRepository,
    UserService,
    UserRepository,
    ReviewService,
    ArticleService,
    ProfileService,
    ProfileRepository,
    BookService,
    FollowService,
  ],
})
export class PhraseModule {}
