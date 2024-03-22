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

@Controller('v1/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNotice(@Body() body: NoticeDto) {
    return await this.noticeService.setNotice(body.title, body.body, body.type);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getNoticeList() {
    return await this.noticeService.getNoticeList();
  }

  @Get('uuid')
  @UseGuards(JwtAccessGuard)
  async getNoticeByUuid(@Query() query) {
    return await this.noticeService.getNoticeByUuid(query.notice_uuid);
  }

  @Get('latest')
  @UseGuards(JwtAccessGuard)
  async getlatestNotice() {
    return await this.noticeService.getlatestNotice();
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteNotice(@Query() query) {
    return await this.noticeService.deleteNotice(query.notice_uuid);
  }
}
