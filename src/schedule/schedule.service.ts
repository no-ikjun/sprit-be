import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly notificationService: NotificationService) {}

  @Cron('0 4 21 * * *')
  handleCron() {
    this.notificationService.sendTimeMessage(
      '독서 시간 알림',
      '독서 시간이 되었습니다. 책을 읽어보세요!',
      {},
      'agree_02',
    );
  }
}
