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
    GlobalFcmService,
    RecordRepository,
    JwtService,
  ],
})
export class QuestModule {}
