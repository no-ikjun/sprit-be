import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { HttpModule } from '@nestjs/axios';
import { ReviewService } from 'src/review/review.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/global/entities/book.entity';
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
    TypeOrmModule.forFeature([Book, User, Review]),
  ],
  providers: [BookService, ReviewService, UserService, UserRepository],
  controllers: [BookController],
})
export class BookModule {}
