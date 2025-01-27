import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('article')
@Unique(['user_uuid', 'book_uuid', 'type', 'data'])
export class Article {
  @PrimaryColumn()
  article_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: true })
  data: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
