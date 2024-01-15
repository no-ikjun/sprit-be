import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('remind_agree')
export class RemindAgree {
  @PrimaryColumn()
  agree_uuid: string;

  @Column()
  agree_01: boolean;

  @Column()
  time_01: number;
}
