import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('record')
export class Record {
  @PrimaryColumn({ nullable: false })
  record_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false, default: 'TIME' })
  goal_type: string;

  @Column({ nullable: false, default: 0 })
  goal_scale: number;

  @Column({ nullable: false, default: 0 })
  page_start: number;

  @Column({ default: 0 })
  page_end: number;

  @Column({ nullable: false, default: 0 })
  total_time: number;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  start: Date;

  @Column({ nullable: true })
  end?: Date;

  @Column({ nullable: false, default: false })
  goal_achieved: boolean;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
