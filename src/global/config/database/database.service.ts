import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { Banner } from 'src/global/entities/banner.entity';
import { Book } from 'src/global/entities/book.entity';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { BookReport } from 'src/global/entities/book_report.entity';
import { FcmToken } from 'src/global/entities/fcm_token.entity';
import { Follow } from 'src/global/entities/follow.entity';
import { Location } from 'src/global/entities/location.entity';
import { Notice } from 'src/global/entities/notice.entity';
import { Phrase } from 'src/global/entities/phrase.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { Quest } from 'src/global/entities/quest.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { Record } from 'src/global/entities/record.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { Review } from 'src/global/entities/review.entity';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { User } from 'src/global/entities/user.entity';
import { Version } from 'src/global/entities/version.entity';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      port: this.configService.get<number>('DATABASE_PORT'),
      host: this.configService.get<string>('DATABASE_HOST'),
      database: this.configService.get<string>('DATABASE_NAME'),
      timezone: '+09:00',
      entities: [
        Article,
        ArticleLike,
        Banner,
        Book,
        BookLibrary,
        BookReport,
        FcmToken,
        Notice,
        Phrase,
        Profile,
        ProfileRecommendBook,
        Quest,
        QuestAgree,
        QuestApply,
        Record,
        RemindAgree,
        Review,
        TimeAgree,
        User,
        Follow,
        Version,
        Location,
      ],
      synchronize: false,
    };
  }
}
