import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileRecommendBook } from './profile_recommend_book.entity';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  profile_uuid: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    default: 'profiles/default.png',
  })
  image: string;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  description: string;

  @OneToMany(() => ProfileRecommendBook, (recommend) => recommend.profile, {
    cascade: true,
  })
  recommend_list: ProfileRecommendBook[];
}
