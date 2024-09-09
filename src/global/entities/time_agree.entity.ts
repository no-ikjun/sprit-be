import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('time_agree')
export class TimeAgree {
  @PrimaryColumn({ nullable: false })
  agree_uuid: string;

  @Column({ nullable: false, default: true })
  agree_01: boolean;

  @Column({ nullable: false, default: 20 })
  time_01: number;

  @Column({ nullable: false, default: true })
  agree_02: boolean;
}
