import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('banner')
export class Banner {
  @PrimaryColumn()
  banner_uuid: string;

  @Column()
  banner_url: string;

  @Column()
  created_at: Date;

  @Column()
  click_url: string;
}
