import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('quest_agree')
export class QuestAgree {
  @PrimaryColumn()
  agree_uuid: string;

  @Column()
  agree_01: boolean;

  @Column()
  agree_02: boolean;

  @Column()
  agree_03: boolean;
}
