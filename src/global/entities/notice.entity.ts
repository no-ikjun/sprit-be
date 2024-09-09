import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('notice')
export class Notice {
  @PrimaryColumn({ nullable: false })
  notice_uuid: string;

  @Column({ nullable: false })
  title: string;

  @Column()
  body: string;

  @Column({ nullable: false, default: '' })
  type: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
