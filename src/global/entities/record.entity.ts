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

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column()
  created_at: string;
}
