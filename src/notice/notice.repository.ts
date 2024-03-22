import { Injectable } from '@nestjs/common';
import { Notice } from 'src/global/entities/notice.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource } from 'typeorm';

@Injectable()
export class NoticeRepository {
  constructor(private readonly dataSource: DataSource) {}

  async setNotice(title: string, body: string, type: string): Promise<void> {
    const notice_uuid = generateRamdomId(
      'NC' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.dataSource.manager.save(Notice, {
      notice_uuid,
      title,
      body,
      type,
      created_at: new Date(),
    });
  }

  async getNoticeList(): Promise<Notice[]> {
    return await this.dataSource.manager.find(Notice, {
      order: { created_at: 'DESC' },
    });
  }

  async getNoticeByUuid(notice_uuid: string): Promise<Notice> {
    return await this.dataSource.manager.findOne(Notice, {
      where: { notice_uuid },
    });
  }

  async deleteNotice(notice_uuid: string): Promise<void> {
    await this.dataSource.manager.delete(Notice, { notice_uuid });
  }

  async getlatestNotice(): Promise<Notice> {
    return await this.dataSource.manager.findOne(Notice, {
      where: {},
      order: { created_at: 'DESC' },
    });
  }
}
