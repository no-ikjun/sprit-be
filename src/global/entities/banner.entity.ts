import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('banner')
export class Banner {
  @PrimaryColumn()
  banner_uuid: string;

  @Column()
  background_color: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  icon_url: string;

  @Column()
  created_at: Date;

  @Column()
  click_url: string;
}
