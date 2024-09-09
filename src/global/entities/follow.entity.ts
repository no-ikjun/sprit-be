import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_follow')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  follow_uuid: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'follower_uuid' })
  follower: User; // 팔로우 하는 유저

  @OneToOne(() => User)
  @JoinColumn({ name: 'followee_uuid' })
  followee: User; // 팔로우 받는 유저

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
