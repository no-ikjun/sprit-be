import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fcm_token')
export class FcmToken {
  @PrimaryColumn()
  fcm_token_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  agree_uuid: string;

  @Column()
  fcm_token: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  marketing_agree: boolean;

  @Column()
  agreed_at: Date;
}
