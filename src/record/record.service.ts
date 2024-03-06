import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecordRepository } from './record.repository';
import { UserService } from 'src/user/user.service';
import { NewRecordDto } from './dto/record.dto';
import { Record } from 'src/global/entities/record.entity';
import {
  BookRecordHistoryType,
  MonthlyRecordResponseType,
} from 'src/global/types/response.type';

@Injectable()
export class RecordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly recordRepository: RecordRepository,
    private readonly userService: UserService,
  ) {}

  async setRecord(data: NewRecordDto, access_token: string): Promise<string> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        const user_info = await this.userService.getUserInfo(access_token);
        return await this.recordRepository.setRecord(
          transactionEntityManager,
          data.book_uuid,
          user_info.user_uuid,
          data.goal_type,
          data.goal_scale,
          data.page_start ?? 0,
        );
      },
    );
  }

  async getRecordByRecordUuid(record_uuid: string): Promise<Record> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getRecordByRecordUuid(
          transactionEntityManager,
          record_uuid,
        );
      },
    );
  }

  async getRecordByUserUuid(access_token: string): Promise<Record[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getRecordByUserUuid(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async getNotEndedRecordByUserUuid(access_token: string): Promise<Record> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getNotEndedRecordByUserUuid(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async getEndedRecordByUserUuid(access_token: string): Promise<Record[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getEndedRecordByUserUuid(
          transactionEntityManager,
          user_info.user_uuid,
        );
      },
    );
  }

  async endRecord(
    record_uuid: string,
    page_end: number,
    total_time: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await this.recordRepository.endRecord(
        transactionEntityManager,
        record_uuid,
        page_end ?? 0,
        total_time ?? 0,
      );
    });
  }

  async deleteRecord(record_uuid: string): Promise<void> {
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await this.recordRepository.deleteRecord(
        transactionEntityManager,
        record_uuid,
      );
    });
  }

  async updateGoalAchieved(
    record_uuid: string,
    goal_achieved: boolean,
  ): Promise<void> {
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await this.recordRepository.updateGoalAchieved(
        transactionEntityManager,
        record_uuid,
        goal_achieved,
      );
    });
  }

  async getLastPage(
    book_uuid: string,
    access_token: string,
    is_before_record: boolean,
  ): Promise<number> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getLastPage(
          transactionEntityManager,
          user_info.user_uuid,
          book_uuid,
          is_before_record,
        );
      },
    );
  }

  async getRecordCountByUserUuid(
    access_token: string,
    count: number,
  ): Promise<number[]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getRecordCountByUserUuid(
          transactionEntityManager,
          user_info.user_uuid,
          count,
        );
      },
    );
  }

  async getDailyRecordTotalTime(
    access_token: string,
    year: number,
    month: number,
    date: number,
  ): Promise<number> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getDailyRecordTotalTime(
          transactionEntityManager,
          user_info.user_uuid,
          year,
          month,
          date,
        );
      },
    );
  }

  async getWeeklyRecordHistory(
    access_token: string,
    back_week: number,
    count: number,
    todayDay: number,
  ): Promise<BookRecordHistoryType[][]> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getWeeklyRecordHistory(
          transactionEntityManager,
          user_info.user_uuid,
          back_week,
          count,
          todayDay,
        );
      },
    );
  }

  async getMonthlyRecordCount(
    access_token: string,
    year: number,
    month: number,
    kind: string,
  ): Promise<MonthlyRecordResponseType> {
    const user_info = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.recordRepository.getReadingRecordCountsByMonth(
          transactionEntityManager,
          user_info.user_uuid,
          year,
          month,
          kind,
        );
      },
    );
  }
}
