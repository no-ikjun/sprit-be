import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Quest {
  @PrimaryColumn({ nullable: false })
  quest_uuid: string;

  @Column({ nullable: false, default: '' })
  title: string;

  @Column()
  short_description: string;

  @Column()
  long_description: string;

  @Column()
  mission: string;

  @Column()
  icon_url: string;

  @Column()
  thumbnail_url: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  end_date: Date;

  @Column({ nullable: false, default: 0 })
  limit: number;

  @Column({ nullable: false, default: 0 })
  apply_count: number;

  @Column({ nullable: false, default: false })
  is_ended: boolean;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
