import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileRecommendBook } from './profile_book.entity';

@Entity()
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
    default: 'https://d3ob3cint7tr3s.cloudfront.net/profiles/default.png',
  })
  image: string;

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  description: string;

  @OneToMany(() => ProfileRecommendBook, (recommend) => recommend.profile, {
    cascade: true,
  })
  recommend_list: ProfileRecommendBook[];
}
