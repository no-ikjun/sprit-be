import { Injectable } from '@nestjs/common';
import { Record } from 'src/global/entities/record.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class RecordRepository {
  constructor(private readonly dataSource: DataSource) {}

  async setRecord(
    transactionEntityManager: EntityManager,
    book_uuid: string,
    user_uuid: string,
    goal_type: string,
    goal_scale: number,
  ): Promise<void> {
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
      start: new Date(),
      created_at: new Date(),
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
      where: { user_uuid: user_uuid, end: null },
    });
  }

  async endRecord(
    transactionEntityManager: EntityManager,
    record_uuid: string,
  ): Promise<void> {
    await transactionEntityManager.update(
      Record,
      { record_uuid: record_uuid },
      { end: new Date() },
    );
  }
}
