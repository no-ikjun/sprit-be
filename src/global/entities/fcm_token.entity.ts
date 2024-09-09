import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fcm_token')
export class FcmToken {
  @PrimaryColumn({ nullable: false })
  fcm_token_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false })
  agree_uuid: string;

  @Column()
  fcm_token: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: false, default: true })
  marketing_agree: boolean;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  agreed_at: Date;
}
