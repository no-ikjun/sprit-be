import { Module } from '@nestjs/common';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BookService } from 'src/book/book.service';
import { ReviewService } from 'src/review/review.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationRepository } from 'src/notification/notification.repository';
import { GlobalFcmService } from 'src/firebase/fcm.service';
import { RecordRepository } from 'src/record/record.repository';
import { PhraseRepository } from 'src/phrase/phrase.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
import { Quest } from 'src/global/entities/quest.entity';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { FcmToken } from 'src/global/entities/fcm_token.entity';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { Phrase } from 'src/global/entities/phrase.entity';
import { Record } from 'src/global/entities/record.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { User } from 'src/global/entities/user.entity';
import { Review } from 'src/global/entities/review.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`,
        },
      }),
    }),
    HttpModule,
    TypeOrmModule.forFeature([
      Book,
      BookLibrary,
      Quest,
      QuestApply,
      FcmToken,
      TimeAgree,
      RemindAgree,
      QuestAgree,
      Phrase,
      Record,
      User,
      Review,
    ]),
  ],
  controllers: [QuestController],
  providers: [
    QuestService,
    UserService,
    UserRepository,
    BookService,
    ReviewService,
    NotificationService,
    NotificationRepository,
    PhraseRepository,
    GlobalFcmService,
    RecordRepository,
    JwtService,
  ],
})
export class QuestModule {}
