import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class NoticeRepository {
  constructor(private readonly dataSource: DataSource) {}
}
