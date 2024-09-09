import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class QuestApply {
  @PrimaryColumn({ nullable: false })
  apply_uuid: string;

  @Column({ nullable: false })
  quest_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false, default: 'APPLY' })
  state: string;

  @Column({ nullable: false, default: '' })
  phone_number: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
