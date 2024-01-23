import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecordRepository } from './record.repository';
import { UserService } from 'src/user/user.service';
import { NewRecordDto } from './dto/record.dto';
import { Record } from 'src/global/entities/record.entity';

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

  async endRecord(record_uuid: string, page_end: number): Promise<void> {
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await this.recordRepository.endRecord(
        transactionEntityManager,
        record_uuid,
        page_end ?? 0,
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
}
