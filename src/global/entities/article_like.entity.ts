import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('article_like')
export class ArticleLike {
  @PrimaryGeneratedColumn('uuid')
  article_like_uuid: string;

  @Column({ nullable: false })
  article_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
