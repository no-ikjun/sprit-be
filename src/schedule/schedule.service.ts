import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly notificationService: NotificationService) {}

  timeMessage(time: number) {
    this.notificationService.sendTimeMessage(
      '스프릿 독서 시간 알림 📚',
      '독서할 시간이 되었어요! 오늘도 꾸준히 스프릿과 함께 독서하세요 😊',
      {},
      'agree_02',
      time,
    );
  }

  @Cron('0 0 1 * * *')
  sendTimeMessage01() {
    this.timeMessage(1);
  }

  @Cron('0 0 2 * * *')
  sendTimeMessage02() {
    this.timeMessage(2);
  }

  @Cron('0 0 3 * * *')
  sendTimeMessage03() {
    this.timeMessage(3);
  }

  @Cron('0 0 4 * * *')
  sendTimeMessage04() {
    this.timeMessage(4);
  }

  @Cron('0 0 5 * * *')
  sendTimeMessage05() {
    this.timeMessage(5);
  }

  @Cron('0 0 6 * * *')
  sendTimeMessage06() {
    this.timeMessage(6);
  }

  @Cron('0 0 7 * * *')
  sendTimeMessage07() {
    this.timeMessage(7);
  }

  @Cron('0 0 8 * * *')
  sendTimeMessage08() {
    this.timeMessage(8);
  }

  @Cron('0 0 9 * * *')
  sendTimeMessage09() {
    this.timeMessage(9);
  }

  @Cron('0 0 10 * * *')
  sendTimeMessage10() {
    this.timeMessage(10);
  }

  @Cron('0 0 11 * * *')
  sendTimeMessage11() {
    this.timeMessage(11);
  }

  @Cron('0 0 12 * * *')
  sendTimeMessage12() {
    this.timeMessage(24);
  }

  @Cron('0 0 13 * * *')
  sendTimeMessage13() {
    this.timeMessage(13);
  }

  @Cron('0 0 14 * * *')
  sendTimeMessage14() {
    this.timeMessage(14);
  }

  @Cron('0 0 15 * * *')
  sendTimeMessage15() {
    this.timeMessage(15);
  }

  @Cron('0 0 16 * * *')
  sendTimeMessage16() {
    this.timeMessage(16);
  }

  @Cron('0 0 17 * * *')
  sendTimeMessage17() {
    this.timeMessage(17);
  }

  @Cron('0 0 18 * * *')
  sendTimeMessage18() {
    this.timeMessage(18);
  }

  @Cron('0 0 19 * * *')
  sendTimeMessage19() {
    this.timeMessage(19);
  }

  @Cron('0 0 20 * * *')
  sendTimeMessage20() {
    this.timeMessage(20);
  }

  @Cron('0 0 21 * * *')
  sendTimeMessage21() {
    this.timeMessage(21);
  }

  @Cron('0 0 22 * * *')
  sendTimeMessage22() {
    this.timeMessage(22);
  }

  @Cron('0 0 23 * * *')
  sendTimeMessage23() {
    this.timeMessage(23);
  }

  @Cron('0 0 0 * * *')
  sendTimeMessage24() {
    this.timeMessage(12);
  }
}
