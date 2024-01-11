import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class QuestApply {
  @PrimaryColumn()
  apply_uuid: string;

  @Column()
  quest_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  state: string;

  @Column()
  created_at: Date;
}
