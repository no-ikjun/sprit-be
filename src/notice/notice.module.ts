import { Module } from '@nestjs/common';
import { NoticeController } from './notice.controller';
import { NoticeService } from './notice.service';
import { NoticeRepository } from './notice.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from 'src/global/entities/notice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
})
export class NoticeModule {}
