import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/book.service';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { Record } from 'src/global/entities/record.entity';
import {
  BookRecordHistoryType,
  BookRecordHistoryTypeV2,
  MonthlyRecordResponseType,
} from 'src/global/types/response.type';
import {
  generateRamdomId,
  getRandomString,
  getToday,
  getWeekRange,
} from 'src/global/utils';
import { Between, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class RecordRepository {
  constructor(
    private readonly bookService: BookService,
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @InjectRepository(BookLibrary)
    private readonly bookLibraryRepository: Repository<BookLibrary>,
  ) {}

  async setRecord(
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
    await this.recordRepository.save({
      record_uuid: record_uuid,
      book_uuid: book_uuid,
      user_uuid: user_uuid,
      goal_type: goal_type,
      goal_scale: goal_scale,
      page_start: page_start,
      start: new Date(),
      created_at: new Date(),
    });
    await this.bookService.addScoreToBook(book_uuid, 10);
    return record_uuid;
  }

  async getRecordByRecordUuid(record_uuid: string): Promise<Record> {
    return await this.recordRepository.findOne({
      where: { record_uuid: record_uuid },
    });
  }

  async getRecordByUserUuid(user_uuid: string): Promise<Record[]> {
    return await this.recordRepository.find({
      where: { user_uuid: user_uuid },
      order: { created_at: 'DESC' },
    });
  }

  async getNotEndedRecordByUserUuid(user_uuid: string): Promise<Record> {
    return await this.recordRepository.findOne({
      where: { user_uuid: user_uuid, end: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async getEndedRecordByUserUuid(user_uuid: string): Promise<Record[]> {
    return await this.recordRepository.find({
      where: { user_uuid: user_uuid, end: Not(IsNull()) },
      order: { created_at: 'DESC' },
    });
  }

  async endRecord(
    record_uuid: string,
    page_end?: number,
    total_time?: number,
  ): Promise<void> {
    await this.recordRepository.update(
      { record_uuid: record_uuid },
      { end: new Date(), page_end: page_end, total_time: total_time },
    );
  }

  async deleteRecord(record_uuid: string): Promise<void> {
    await this.recordRepository.delete({ record_uuid: record_uuid });
  }

  async updateGoalAchieved(
    record_uuid: string,
    goal_achieved: boolean,
  ): Promise<void> {
    await this.recordRepository.update(
      { record_uuid: record_uuid },
      { goal_achieved: goal_achieved },
    );
  }

  async getLastPage(
    user_uuid: string,
    book_uuid: string,
    is_before_record: boolean,
  ): Promise<number> {
    const read_history = await this.bookLibraryRepository.findOne({
      where: { user_uuid: user_uuid, book_uuid: book_uuid, state: 'AFTER' },
      order: { created_at: 'DESC' },
    });
    if (read_history !== null) {
      return 0;
    }
    const records = await this.recordRepository.find({
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
    book_uuid: string,
    user_uuid: string,
  ): Promise<number> {
    return await this.recordRepository.count({
      where: { book_uuid: book_uuid, user_uuid: user_uuid },
    });
  }

  async getDailyRecordTotalTime(
    user_uuid: string,
    year: number,
    month: number,
    date: number,
  ): Promise<number> {
    const startOfDay = new Date(Date.UTC(year, month - 1, date));
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(Date.UTC(year, month - 1, date));
    endOfDay.setHours(23, 59, 59, 999);
    const records = await this.recordRepository.find({
      where: {
        user_uuid: user_uuid,
        end: Between(startOfDay, endOfDay),
      },
    });
    let total_time = 0;
    for (let i = 0; i < records.length; i++) {
      total_time += records[i].total_time;
    }
    return total_time;
  }

  async getRecordCountByUserUuid(
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

      const count = await this.recordRepository.count({
        where: {
          user_uuid: user_uuid,
          end: Between(startOfDay, endOfDay),
        },
      });
      result.push(count);
    }
    return result.reverse();
  }

  async getWeeklyRecordHistory(
    user_uuid: string,
    back_week: number,
    count: number,
    todayDay: number, //일요일 0, 월요일 1, ... , 토요일 6
  ): Promise<BookRecordHistoryType[][]> {
    const result: BookRecordHistoryType[][] = [];
    let length = count;
    let minusCount = 0;
    if (back_week > 0) {
      length = 7;
      minusCount = 7 * (back_week - 1) + todayDay + 1;
    }
    for (let i = 0; i < length; i++) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i - minusCount);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i - minusCount);
      endOfDay.setHours(23, 59, 59, 999);

      const record_data = await this.recordRepository.find({
        where: {
          user_uuid: user_uuid,
          end: Between(startOfDay, endOfDay),
        },
        order: { created_at: 'ASC' },
      });
      //독서 기록 데이터를 책 별로 묶어서 저장
      const aggregatedByBookUuid: {
        [book_uuid: string]: BookRecordHistoryType;
      } = {};

      record_data.forEach((record) => {
        if (aggregatedByBookUuid[record.book_uuid]) {
          aggregatedByBookUuid[record.book_uuid].total_time +=
            record.total_time;
          aggregatedByBookUuid[record.book_uuid].goal_achieved =
            aggregatedByBookUuid[record.book_uuid].goal_achieved &&
            record.goal_achieved;
        } else {
          aggregatedByBookUuid[record.book_uuid] = {
            book_uuid: record.book_uuid,
            goal_achieved: record.goal_achieved,
            total_time: record.total_time,
          };
        }
      });
      const recordDataByDate: BookRecordHistoryType[] =
        Object.values(aggregatedByBookUuid);
      result.push(recordDataByDate);
    }
    return result.reverse();
  }

  async getWeeklyRecordHistoryV2(
    user_uuid: string,
    back_week: number,
    count: number,
    todayDay: number, //일요일 0, 월요일 1, ... , 토요일 6
  ): Promise<BookRecordHistoryTypeV2[][]> {
    const result = [];
    let length = count;
    let minusCount = 0;
    if (back_week > 0) {
      length = 7;
      minusCount = 7 * (back_week - 1) + todayDay + 1;
    }
    for (let i = 0; i < length; i++) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i - minusCount);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i - minusCount);
      endOfDay.setHours(23, 59, 59, 999);

      const recordData = await this.recordRepository.find({
        where: {
          user_uuid: user_uuid,
          end: Between(startOfDay, endOfDay),
        },
        order: { created_at: 'ASC' },
      });
      const recordsByBookUuid = {};

      for (const record of recordData) {
        const bookInfo = await this.bookService.findByBookUuid(
          record.book_uuid,
        );
        console.log(bookInfo);
        if (!recordsByBookUuid[bookInfo.book_uuid]) {
          // 새로운 book_uuid라면 객체 생성
          recordsByBookUuid[bookInfo.book_uuid] = {
            book_uuid: bookInfo.book_uuid,
            goal_achieved: record.goal_achieved,
            total_time: record.total_time,
            book_title: bookInfo.title,
            book_thumbnail: bookInfo.thumbnail,
            authors: bookInfo.authors,
            publisher: bookInfo.publisher,
          };
        } else {
          // 기존에 있던 book_uuid라면 total_time만 업데이트
          recordsByBookUuid[bookInfo.book_uuid].total_time += record.total_time;
        }
      }

      const recordDataByDate = Object.values(recordsByBookUuid);
      result.push(recordDataByDate);
    }
    console.log(result);
    return result.reverse();
  }

  async getReadingRecordCountsByMonth(
    user_uuid: string,
    year: number,
    month: number,
    kind: string,
  ): Promise<MonthlyRecordResponseType> {
    const presentMonthStart = new Date(Date.UTC(year, month, 1));
    const presentMonthEnd = new Date(
      Date.UTC(year, month + 1, 0, 23, 59, 59, 999),
    );
    const pastMonthStart = new Date(Date.UTC(year, month - 1, 1));
    const pastMonthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    let presentMonthCount = 0;
    let pastMonthCount = 0;

    switch (kind) {
      case 'COUNT':
        presentMonthCount = await this.recordRepository.count({
          where: {
            user_uuid: user_uuid,
            created_at: Between(presentMonthStart, presentMonthEnd),
          },
        });
        pastMonthCount = await this.recordRepository.count({
          where: {
            user_uuid: user_uuid,
            created_at: Between(pastMonthStart, pastMonthEnd),
          },
        });
        break;
      case 'GOAL':
        presentMonthCount = await this.recordRepository.count({
          where: {
            user_uuid: user_uuid,
            created_at: Between(presentMonthStart, presentMonthEnd),
            goal_achieved: true,
          },
        });
        pastMonthCount = await this.recordRepository.count({
          where: {
            user_uuid: user_uuid,
            created_at: Between(pastMonthStart, pastMonthEnd),
            goal_achieved: true,
          },
        });
        break;
      case 'BOOK':
        const presentMonthBooks = await this.recordRepository
          .createQueryBuilder('record')
          .select('COUNT(DISTINCT record.book_uuid)', 'count')
          .where('record.user_uuid = :user_uuid', { user_uuid })
          .andWhere('record.created_at BETWEEN :start AND :end', {
            start: presentMonthStart,
            end: presentMonthEnd,
          })
          .getRawOne();

        presentMonthCount = parseInt(presentMonthBooks.count, 10);

        const pastMonthBooks = await this.recordRepository
          .createQueryBuilder('record')
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

  async getWeeklyData(offset: number, user_uuid: string): Promise<number> {
    let weeklyDataCount = 0;

    const startWeek = getWeekRange(offset).startOfWeek;
    const endWeek = getWeekRange(offset).endOfWeek;

    const weeklyRecordData = await this.recordRepository
      .createQueryBuilder('record')
      .select('COUNT(DISTINCT record.book_uuid)', 'count')
      .where('record.user_uuid = :user_uuid', { user_uuid })
      .andWhere('record.created_at BETWEEN :start AND :end', {
        start: startWeek,
        end: endWeek,
      })
      .getRawOne();

    weeklyDataCount = parseInt(weeklyRecordData.count, 10);

    return weeklyDataCount;
  }
}
