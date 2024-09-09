import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('phrase')
export class Phrase {
  @PrimaryColumn({ nullable: false })
  phrase_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column()
  phrase: string;

  @Column({ nullable: false, default: 0 })
  page: number;

  @Column({ nullable: false, default: false })
  remind: boolean;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
