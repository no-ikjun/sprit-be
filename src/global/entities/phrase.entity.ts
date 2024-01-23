import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('phrase')
export class Phrase {
  @PrimaryColumn()
  phrase_uuid: string;

  @Column()
  book_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  phrase: string;

  @Column()
  remind: boolean;

  @Column()
  created_at: Date;
}
