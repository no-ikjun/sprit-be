import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('user')
export class User {
  @PrimaryColumn({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false })
  user_nickname: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ nullable: false })
  user_password: string;

  @Column({ nullable: false })
  register_type: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  registered_at: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
