import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './global/config/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './global/config/database/database.service';
import { BookModule } from './book/book.module';
import { HttpModule } from '@nestjs/axios';
import { BannerModule } from './banner/banner.module';
import { ReviewModule } from './review/review.module';
import { QuestModule } from './quest/quest.module';
import { NotificationModule } from './notification/notification.module';
import { BookLibraryModule } from './book_library/book_library.module';
import { RecordModule } from './record/record.module';
import { PhraseModule } from './phrase/phrase.module';
import { BookReportModule } from './book_report/book_report.module';
import { ScheduleModule } from './schedule/schedule.module';
import { NotificationService } from './notification/notification.service';
import { NotificationRepository } from './notification/notification.repository';
import { UserService } from './user/user.service';
import { UserRepository } from './user/user.repository';
import { GlobalFcmService } from './firebase/fcm.service';
import { RecordService } from './record/record.service';
import { RecordRepository } from './record/record.repository';
import { BookService } from './book/book.service';
import { ReviewService } from './review/review.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NoticeModule } from './notice/notice.module';
import { VersionModule } from './version/version.module';
import { PhraseRepository } from './phrase/phrase.repository';
import { Book } from './global/entities/book.entity';
import { FcmToken } from './global/entities/fcm_token.entity';
import { TimeAgree } from './global/entities/time_agree.entity';
import { RemindAgree } from './global/entities/remind_agree.entity';
import { QuestAgree } from './global/entities/quest_agree.entity';
import { BookLibrary } from './global/entities/book_library.entity';
import { Record } from './global/entities/record.entity';
import { Phrase } from './global/entities/phrase.entity';
import { User } from './global/entities/user.entity';
import { Review } from './global/entities/review.entity';
import { ProfileModule } from './profile/profile.module';
@Module({
  imports: [
    ScheduleModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
      inject: [DatabaseService],
    }),
    AuthModule,
    UserModule,
    DatabaseModule,
    BookModule,
    HttpModule,
    BannerModule,
    ReviewModule,
    QuestModule,
    NotificationModule,
    BookLibraryModule,
    RecordModule,
    PhraseModule,
    BookReportModule,
    ScheduleModule,
    NoticeModule,
    VersionModule,
    TypeOrmModule.forFeature([
      Book,
      BookLibrary,
      Record,
      FcmToken,
      TimeAgree,
      RemindAgree,
      QuestAgree,
      Phrase,
      User,
      Review,
    ]),
    ProfileModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`,
        },
      }),
      global: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    NotificationService,
    NotificationRepository,
    UserService,
    UserRepository,
    GlobalFcmService,
    RecordService,
    RecordRepository,
    BookService,
    ReviewService,
    JwtService,
    PhraseRepository,
  ],
})
export class AppModule {}
