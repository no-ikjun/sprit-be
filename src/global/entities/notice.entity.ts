import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('notice')
export class Notice {
  @PrimaryColumn()
  notice_uuid: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  type: string;

  @Column()
  created_at: Date;
}
