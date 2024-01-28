import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('book_report')
export class BookReport {
  @PrimaryColumn()
  book_report_uuid: string;

  @Column()
  book_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  report: string;

  @Column()
  created_at: Date;
}
