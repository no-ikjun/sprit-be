import { Module } from '@nestjs/common';
import { BookReportController } from './book_report.controller';
import { BookReportService } from './book_report.service';
import { BookReportRepository } from './book_report.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

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
  ],
  controllers: [BookReportController],
  providers: [
    BookReportService,
    BookReportRepository,
    UserService,
    UserRepository,
  ],
})
export class BookReportModule {}
