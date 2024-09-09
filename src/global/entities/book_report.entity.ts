import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('book_report')
export class BookReport {
  @PrimaryColumn({ nullable: false })
  book_report_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column()
  report: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
