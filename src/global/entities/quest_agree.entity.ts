import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('quest_agree')
export class QuestAgree {
  @PrimaryColumn({ nullable: false })
  agree_uuid: string;

  @Column({ nullable: false, default: true })
  agree_01: boolean;

  @Column({ nullable: false, default: true })
  agree_02: boolean;

  @Column({ nullable: false, default: true })
  agree_03: boolean;
}
