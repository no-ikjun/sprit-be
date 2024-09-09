import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './profile.repository';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/global/entities/profile.entity';
import { User } from 'src/global/entities/user.entity';
import { Book } from 'src/global/entities/book.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_book.entity';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { UserService } from 'src/user/user.service';
import { Review } from 'src/global/entities/review.entity';
import { UserRepository } from 'src/user/user.repository';

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
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    ProfileRepository,
    BookService,
    ReviewService,
    UserService,
    UserRepository,
  ],
})
export class ProfileModule {}
