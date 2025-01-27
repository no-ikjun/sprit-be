import { forwardRef, Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './profile.repository';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/global/entities/profile.entity';
import { User } from 'src/global/entities/user.entity';
import { Book } from 'src/global/entities/book.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { Review } from 'src/global/entities/review.entity';
import { UserRepository } from 'src/user/user.repository';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';
import { RecordModule } from 'src/record/record.module';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      Profile,
      User,
      Book,
      ProfileRecommendBook,
      Review,
      Follow,
    ]),
    forwardRef(() => RecordModule),
    forwardRef(() => BookModule),
  ],
  controllers: [ProfileController],
  providers: [
    BookService,
    ReviewService,
    UserService,
    UserRepository,
    FollowService,
    ProfileService,
    ProfileRepository,
    BookService,
  ],
  exports: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
