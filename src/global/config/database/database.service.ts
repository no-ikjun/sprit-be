import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Banner } from 'src/global/entities/banner.entity';
import { Book } from 'src/global/entities/book.entity';
import { Quest } from 'src/global/entities/quest.entity';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { Review } from 'src/global/entities/review.entity';
import { User } from 'src/global/entities/user.entity';

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
      entities: [User, Book, Banner, Review, Quest, QuestApply],
      synchronize: false,
    };
  }
}
