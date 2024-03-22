import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { NoticeDto } from './dto/notice.dto';
import { Notice } from 'src/global/entities/notice.entity';

@Controller('v1/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNotice(@Body() body: NoticeDto): Promise<void> {
    return await this.noticeService.setNotice(body.title, body.body, body.type);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getNoticeList(): Promise<Notice[]> {
    return await this.noticeService.getNoticeList();
  }

  @Get('uuid')
  @UseGuards(JwtAccessGuard)
  async getNoticeByUuid(@Query() query): Promise<Notice> {
    return await this.noticeService.getNoticeByUuid(query.notice_uuid);
  }

  @Get('latest')
  @UseGuards(JwtAccessGuard)
  async getlatestNotice(): Promise<string> {
    return await this.noticeService.getlatestNotice();
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteNotice(@Query() query): Promise<void> {
    return await this.noticeService.deleteNotice(query.notice_uuid);
  }
}
