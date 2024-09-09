import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('remind_agree')
export class RemindAgree {
  @PrimaryColumn({ nullable: false })
  agree_uuid: string;

  @Column({ nullable: false, default: true })
  agree_01: boolean;

  @Column({ nullable: false, default: 7 })
  time_01: number;
}
