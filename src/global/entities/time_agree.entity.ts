import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('time_agree')
export class TimeAgree {
  @PrimaryColumn()
  agree_uuid: string;

  @Column()
  agree_01: boolean;

  @Column()
  time_01: number;

  @Column()
  agree_02: boolean;
}
