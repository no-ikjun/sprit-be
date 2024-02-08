import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Quest {
  @PrimaryColumn()
  quest_uuid: string;

  @Column()
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

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  limit: number;

  @Column()
  apply_count: number;

  @Column()
  is_ended: boolean;

  @Column()
  created_at: Date;
}
