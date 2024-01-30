import { Module } from '@nestjs/common';
import { BookLibraryController } from './book_library.controller';
import { BookLibraryService } from './book_library.service';
import { BookLibraryRepository } from './book_library.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { RecordRepository } from 'src/record/record.repository';
import { BookService } from 'src/book/book.service';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';

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
  controllers: [BookLibraryController],
  providers: [
    BookLibraryService,
    BookLibraryRepository,
    UserService,
    UserRepository,
    RecordRepository,
    BookService,
    ReviewService,
  ],
})
export class BookLibraryModule {}
