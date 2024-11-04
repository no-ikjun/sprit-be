import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  article_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false })
  type: string;

  @Column()
  data: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
