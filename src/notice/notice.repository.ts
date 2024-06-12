import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from 'src/global/entities/notice.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class NoticeRepository {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  async setNotice(title: string, body: string, type: string): Promise<void> {
    const notice_uuid = generateRamdomId(
      'NC' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.noticeRepository.save({
      notice_uuid,
      title,
      body,
      type,
      created_at: new Date(),
    });
  }

  async getNoticeList(): Promise<Notice[]> {
    return await this.noticeRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getNoticeByUuid(notice_uuid: string): Promise<Notice> {
    return await this.noticeRepository.findOne({
      where: { notice_uuid },
    });
  }

  async deleteNotice(notice_uuid: string): Promise<void> {
    await this.noticeRepository.delete({ notice_uuid });
  }

  async getlatestNotice(): Promise<string> {
    const notice = await this.noticeRepository.findOne({
      where: {},
      order: { created_at: 'DESC' },
    });
    return notice.notice_uuid;
  }
}
