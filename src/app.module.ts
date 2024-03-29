import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './global/config/database/database.module';
import { ConfigModule } from '@nestjs/config';
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
import { JwtService } from '@nestjs/jwt';
import { NoticeModule } from './notice/notice.module';

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
  ],
})
export class AppModule {}
