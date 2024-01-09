import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Book } from './book.entity'; // 적절한 경로로 조정하세요.

@Entity('review')
export class Review {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  review_uuid: string;

  @Column('int')
  score: number;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'varchar', length: 255 })
  user_uuid: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_uuid' })
  book: Book;
}
