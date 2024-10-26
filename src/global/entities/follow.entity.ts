import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_follow')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  follow_uuid: string;

  // 팔로우 하는 유저 (follower)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'follower' })
  follower: User;

  // 팔로우 받는 유저 (followee)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'followee' })
  followee: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
