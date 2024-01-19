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

@Module({
  imports: [
    ConfigModule.forRoot({
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
