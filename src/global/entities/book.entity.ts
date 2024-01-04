import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('book')
export class Book {
  @PrimaryColumn()
  book_uuid: string;

  @Column()
  isbn: string;

  @Column()
  title: string;

  @Column()
  authors: string;

  @Column()
  publisher: string;

  @Column()
  translators: string;

  @Column()
  search_url: string;

  @Column()
  thumbnail: string;

  @Column()
  content: string;

  @Column()
  published_at: Date;

  @Column()
  updated_at: Date;
}
