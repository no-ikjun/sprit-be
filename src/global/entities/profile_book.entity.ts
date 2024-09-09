import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Book } from './book.entity';

@Entity()
export class ProfileRecommendBook {
  @PrimaryGeneratedColumn('uuid')
  recommend_uuid: string;

  @ManyToOne(() => Profile, (profile) => profile.recommend_list)
  @JoinColumn({ name: 'profile_uuid' })
  profile: Profile;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_uuid' })
  book: Book;

  @Column({ type: 'int' })
  rank: number;
}
