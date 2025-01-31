import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from 'src/global/entities/follow.entity';
import { User } from 'src/global/entities/user.entity';
import { ProfileRepository } from 'src/profile/profile.repository';
import { BookService } from 'src/book/book.service';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { Book } from 'src/global/entities/book.entity';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { Review } from 'src/global/entities/review.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Follow,
      User,
      Profile,
      ProfileRecommendBook,
      Book,
      Review,
    ]),
    HttpModule,
  ],
  controllers: [FollowController],
  providers: [
    FollowService,
    ProfileRepository,
    BookService,
    ReviewService,
    UserService,
    UserRepository,
  ],
})
export class FollowModule {}
