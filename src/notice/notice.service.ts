import { Injectable } from '@nestjs/common';
import { NoticeRepository } from './notice.repository';
import { Notice } from 'src/global/entities/notice.entity';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async setNotice(title: string, body: string, type: string): Promise<void> {
    await this.noticeRepository.setNotice(title, body, type);
  }

  async getNoticeList(): Promise<Notice[]> {
    return await this.noticeRepository.getNoticeList();
  }

  async getNoticeByUuid(notice_uuid: string): Promise<Notice> {
    return await this.noticeRepository.getNoticeByUuid(notice_uuid);
  }

  async deleteNotice(notice_uuid: string): Promise<void> {
    await this.noticeRepository.deleteNotice(notice_uuid);
  }

  async getlatestNotice(): Promise<string> {
    return await this.noticeRepository.getlatestNotice();
  }
}
