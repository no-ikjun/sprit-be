import { Injectable } from '@nestjs/common';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { Record } from 'src/global/entities/record.entity';
import {
  BookRecordHistoryType,
  MonthlyRecordResponseType,
} from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Between, DataSource, EntityManager, IsNull, Not } from 'typeorm';

@Injectable()
export class RecordRepository {
  constructor(private readonly dataSource: DataSource) {}

  async setRecord(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
    goal_type: string,
    goal_scale: number,
    page_start: number,
  ): Promise<string> {
    const record_uuid = generateRamdomId(
      'RE' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await transactionEntityManager.save(Record, {
      record_uuid: record_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      goal_type: goal_type,
      goal_scale: goal_scale,
      page_start: page_start,
      start: new Date(),
      created_at: new Date(),
    });
    return record_uuid;
  }

  async getRecordByRecordUuid(
    transactionEntityManager: EntityManager,
    record_uuid: string,
  ): Promise<Record> {
    return await transactionEntityManager.findOne(Record, {
      where: { record_uuid: record_uuid },
    });
  }

  async getRecordByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<Record[]> {
    return await transactionEntityManager.find(Record, {
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getNotEndedRecordByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<Record> {
    return await transactionEntityManager.findOne(Record, {
      where: { user_uuid: user_uuid, end: IsNull() },
    });
  }

  async getEndedRecordByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
  ): Promise<Record[]> {
    return await transactionEntityManager.find(Record, {
      where: { user_uuid: user_uuid, end: Not(IsNull()) },
      order: { created_at: 'DESC' },
    });
  }

  async endRecord(
    transactionEntityManager: EntityManager,
    record_uuid: string,
    page_end?: number,
    total_time?: number,
  ): Promise<void> {
    await transactionEntityManager.update(
      Record,
      { record_uuid: record_uuid },
      { end: new Date(), page_end: page_end, total_time: total_time },
    );
  }

  async deleteRecord(
    transactionEntityManager: EntityManager,
    record_uuid: string,
  ): Promise<void> {
    await transactionEntityManager.delete(Record, { record_uuid: record_uuid });
  }

  async updateGoalAchieved(
    transactionEntityManager: EntityManager,
    record_uuid: string,
    goal_achieved: boolean,
  ): Promise<void> {
    await transactionEntityManager.update(
      Record,
      { record_uuid: record_uuid },
      { goal_achieved: goal_achieved },
    );
  }

  async getLastPage(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    book_uuid: string,
    is_before_record: boolean,
  ): Promise<number> {
    const read_history = await transactionEntityManager.findOne(BookLibrary, {
      where: { user_uuid: user_uuid, book_uuid: book_uuid, state: 'AFTER' },
      order: { created_at: 'DESC' },
    });
    if (read_history !== null) {
      return 0;
    }
    const records = await transactionEntityManager.find(Record, {
      where: { user_uuid: user_uuid, book_uuid: book_uuid },
      order: { created_at: 'DESC' },
    });
    let last_page = 0;
    if (records.length > 0 && is_before_record) {
      last_page = records[0].page_end;
    } else if (records.length > 0 && !is_before_record) {
      last_page = records[0].page_start;
    }
    return last_page;
  }

  async getRecordCountByBookUuidandUserUuid(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
  ): Promise<number> {
    return await transactionEntityManager.count(Record, {
      where: { book_uuid: book_uuid, user_uuid: user_uuid },
    });
  }

  async getRecordCountByUserUuid(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    count: number,
  ): Promise<number[]> {
    const result = [];
    for (let i = 0; i < count; i++) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await transactionEntityManager.count(Record, {
        where: {
          user_uuid: user_uuid,
          created_at: Between(startOfDay, endOfDay),
        },
      });
      result.push(count);
    }
    return result.reverse();
  }

  async getWeeklyRecordHistory(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    back_week: number,
    count: number,
  ): Promise<BookRecordHistoryType[][]> {
    const result = [];
    for (let i = 0; i < count; i++) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i - 7 * back_week);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i - 7 * back_week);
      endOfDay.setHours(23, 59, 59, 999);

      const record_data = await transactionEntityManager.find(Record, {
        where: {
          user_uuid: user_uuid,
          end: Between(startOfDay, endOfDay),
        },
        order: { created_at: 'ASC' },
      });
      const record_data_by_date = [];
      for (let j = 0; j < record_data.length; j++) {
        record_data_by_date.push({
          book_uuid: record_data[j].book_uuid,
          goal_achieved: record_data[j].goal_achieved,
          total_time: record_data[j].total_time,
        });
      }
      result.push(record_data_by_date);
    }
    return result.reverse();
  }

  async getReadingRecordCountsByMonth(
    transactionEntityManager: EntityManager,
    user_uuid: string,
    year: number,
    month: number,
    kind: string,
  ): Promise<MonthlyRecordResponseType> {
    const presentMonthStart = new Date(Date.UTC(year, month - 1, 1));
    const presentMonthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const pastMonthStart = new Date(Date.UTC(year, month - 2, 1));
    const pastMonthEnd = new Date(
      Date.UTC(year, month - 1, 0, 23, 59, 59, 999),
    );

    let presentMonthCount = 0;
    let pastMonthCount = 0;

    switch (kind) {
      case 'COUNT':
        presentMonthCount = await transactionEntityManager.count(Record, {
          where: {
            user_uuid: user_uuid,
            created_at: Between(presentMonthStart, presentMonthEnd),
          },
        });
        pastMonthCount = await transactionEntityManager.count(Record, {
          where: {
            user_uuid: user_uuid,
            created_at: Between(pastMonthStart, pastMonthEnd),
          },
        });
        break;
      case 'GOAL':
        presentMonthCount = await transactionEntityManager.count(Record, {
          where: {
            user_uuid: user_uuid,
            created_at: Between(presentMonthStart, presentMonthEnd),
            goal_achieved: true,
          },
        });
        pastMonthCount = await transactionEntityManager.count(Record, {
          where: {
            user_uuid: user_uuid,
            created_at: Between(pastMonthStart, pastMonthEnd),
            goal_achieved: true,
          },
        });
        break;
      case 'BOOK':
        const presentMonthBooks = await transactionEntityManager
          .createQueryBuilder(Record, 'record')
          .select('COUNT(DISTINCT record.book_uuid)', 'count')
          .where('record.user_uuid = :user_uuid', { user_uuid })
          .andWhere('record.created_at BETWEEN :start AND :end', {
            start: presentMonthStart,
            end: presentMonthEnd,
          })
          .getRawOne();

        presentMonthCount = parseInt(presentMonthBooks.count, 10); // 문자열을 숫자로 변환

        const pastMonthBooks = await transactionEntityManager
          .createQueryBuilder(Record, 'record')
          .select('COUNT(DISTINCT record.book_uuid)', 'count')
          .where('record.user_uuid = :user_uuid', { user_uuid })
          .andWhere('record.created_at BETWEEN :start AND :end', {
            start: pastMonthStart,
            end: pastMonthEnd,
          })
          .getRawOne();

        pastMonthCount = parseInt(pastMonthBooks.count, 10);
        break;
    }

    return {
      present_month: presentMonthCount,
      past_month: pastMonthCount,
    };
  }
}
