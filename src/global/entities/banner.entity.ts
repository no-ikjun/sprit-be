import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('banner')
export class Banner {
  @PrimaryColumn({ nullable: false, default: '' })
  banner_uuid: string;

  @Column()
  banner_url: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  click_url: string;
}
