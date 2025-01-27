import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule.service';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationRepository } from 'src/notification/notification.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { GlobalFcmService } from 'src/firebase/fcm.service';
import { RecordService } from 'src/record/record.service';
import { RecordRepository } from 'src/record/record.repository';
import { BookService } from 'src/book/book.service';
import { ReviewService } from 'src/review/review.service';
import { PhraseRepository } from 'src/phrase/phrase.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { FcmToken } from 'src/global/entities/fcm_token.entity';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { Phrase } from 'src/global/entities/phrase.entity';
import { Record } from 'src/global/entities/record.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';
import { ArticleService } from 'src/article/article.service';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { FollowService } from 'src/follow/follow.service';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ProfileService } from 'src/profile/profile.service';
import { ProfileRepository } from 'src/profile/profile.repository';

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([
      Book,
      BookLibrary,
      FcmToken,
      TimeAgree,
      RemindAgree,
      QuestAgree,
      Phrase,
      Record,
      User,
      Review,
      Article,
      ArticleLike,
      Follow,
      Profile,
      ProfileRecommendBook,
    ]),
  ],
  providers: [
    ScheduleService,
    NotificationService,
    NotificationRepository,
    PhraseRepository,
    UserService,
    UserRepository,
    GlobalFcmService,
    RecordService,
    RecordRepository,
    BookService,
    ReviewService,
    ArticleService,
    FollowService,
    ProfileService,
    ProfileRepository,
  ],
})
export class ScheduleModule {}
