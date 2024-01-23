import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('record')
export class Record {
  @PrimaryColumn()
  record_uuid: string;

  @Column()
  book_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  goal_type: string;

  @Column()
  goal_scale: number;

  @Column({ default: 0 })
  page_start: number;

  @Column({ default: 0 })
  page_end: number;

  @Column()
  start: Date;

  @Column({ nullable: true })
  end?: Date;

  @Column()
  created_at: Date;
}
