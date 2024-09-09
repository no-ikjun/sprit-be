import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { HttpModule } from '@nestjs/axios';
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
import { Record } from 'src/global/entities/record.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { Phrase } from 'src/global/entities/phrase.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Book,
      BookLibrary,
      FcmToken,
      TimeAgree,
      RemindAgree,
      QuestAgree,
      Record,
      Phrase,
      User,
      Review,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    UserService,
    UserRepository,
    GlobalFcmService,
    RecordService,
    RecordRepository,
    BookService,
    ReviewService,
    PhraseRepository,
  ],
})
export class NotificationModule {}
