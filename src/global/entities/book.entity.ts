import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ProfileRecommendBook } from './profile_recommend_book.entity';

@Entity('book')
export class Book {
  @PrimaryColumn({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  isbn: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, default: '' })
  authors: string;

  @Column({ nullable: true, default: '' })
  publisher: string;

  @Column({ nullable: true })
  translators: string;

  @Column({ nullable: true, default: '' })
  search_url: string;

  @Column({ nullable: true, default: '' })
  thumbnail: string;

  @Column({ nullable: true, default: '' })
  content: string;

  @Column({ nullable: true })
  published_at: Date;

  @Column({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: true, default: 0 })
  score: number;

  @OneToMany(() => ProfileRecommendBook, (recommend) => recommend.book)
  recommendedProfiles: ProfileRecommendBook[];
}
