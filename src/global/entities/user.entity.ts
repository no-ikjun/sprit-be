import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('user')
export class User {
  @PrimaryColumn()
  user_uuid: string;

  @Column()
  user_nickname: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  user_password: string;

  @Column()
  register_type: string;

  @Column()
  registered_at: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
