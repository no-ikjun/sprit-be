import { Injectable } from '@nestjs/common';
import { RecordRepository } from './record.repository';
import { UserService } from 'src/user/user.service';
import { NewRecordDto } from './dto/record.dto';
import { Record } from 'src/global/entities/record.entity';
import {
  BookRecordHistoryType,
  BookRecordHistoryTypeV2,
  MonthlyRecordResponseType,
} from 'src/global/types/response.type';
import { ArticleService } from 'src/article/article.service';

@Injectable()
export class RecordService {
  constructor(
    private readonly recordRepository: RecordRepository,
    private readonly userService: UserService,
    private readonly articleService: ArticleService,
  ) {}

  async setRecord(data: NewRecordDto, access_token: string): Promise<string> {
    const user_info = await this.userService.getUserInfo(access_token);
    const isFirst = await this.recordRepository.checkIsFirst(
      data.book_uuid,
      user_info.user_uuid,
    );
    if (isFirst) {
      await this.articleService.setNewArticle(
        user_info.user_uuid,
        data.book_uuid,
        'record',
      );
    }
    return await this.recordRepository.setRecord(
      data.book_uuid,
      user_info.user_uuid,
      data.goal_type,
      data.goal_scale,
      data.page_start ?? 0,
    );
  }

  async getRecordByRecordUuid(record_uuid: string): Promise<Record> {
    return await this.recordRepository.getRecordByRecordUuid(record_uuid);
  }

  async getRecordByUserUuid(access_token: string): Promise<Record[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getRecordByUserUuid(user_info.user_uuid);
  }

  async getNotEndedRecordByUserUuid(access_token: string): Promise<Record> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getNotEndedRecordByUserUuid(
      user_info.user_uuid,
    );
  }

  async getEndedRecordByUserUuid(access_token: string): Promise<Record[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getEndedRecordByUserUuid(
      user_info.user_uuid,
    );
  }

  async endRecord(
    record_uuid: string,
    page_end: number,
    total_time: number,
  ): Promise<void> {
    await this.recordRepository.endRecord(record_uuid, page_end, total_time);
  }

  async deleteRecord(record_uuid: string): Promise<void> {
    await this.recordRepository.deleteRecord(record_uuid);
  }

  async updateGoalAchieved(
    record_uuid: string,
    goal_achieved: boolean,
  ): Promise<void> {
    await this.recordRepository.updateGoalAchieved(record_uuid, goal_achieved);
  }

  async getLastPage(
    book_uuid: string,
    access_token: string,
    is_before_record: boolean,
  ): Promise<number> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getLastPage(
      user_info.user_uuid,
      book_uuid,
      is_before_record,
    );
  }

  async updatePage(record_uuid: string, page_end: number): Promise<void> {
    return await this.recordRepository.updatePageEnd(record_uuid, page_end);
  }

  async getRecordCountByUserUuid(
    access_token: string,
    count: number,
  ): Promise<number[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getRecordCountByUserUuid(
      user_info.user_uuid,
      count,
    );
  }

  async getDailyRecordTotalTime(
    access_token: string,
    year: number,
    month: number,
    date: number,
  ): Promise<number> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getDailyRecordTotalTime(
      user_info.user_uuid,
      year,
      month,
      date,
    );
  }

  async getWeeklyRecordHistory(
    access_token: string,
    back_week: number,
    count: number,
    todayDay: number,
  ): Promise<BookRecordHistoryType[][]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getWeeklyRecordHistory(
      user_info.user_uuid,
      back_week,
      count,
      todayDay,
    );
  }

  async getWeeklyRecordHistoryV2(
    access_token: string,
    back_week: number,
    count: number,
    todayDay: number,
  ): Promise<BookRecordHistoryTypeV2[][]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getWeeklyRecordHistoryV2(
      user_info.user_uuid,
      back_week,
      count,
      todayDay,
    );
  }

  async getMonthlyRecordCount(
    access_token: string,
    year: number,
    month: number,
    kind: string,
  ): Promise<MonthlyRecordResponseType> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.recordRepository.getReadingRecordCountsByMonth(
      user_info.user_uuid,
      year,
      month,
      kind,
    );
  }
}
