import { Injectable } from '@nestjs/common';
import { BookLibrary } from 'src/global/entities/book_library.entity';
import { Record } from 'src/global/entities/record.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager, IsNull, Not } from 'typeorm';

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
}
