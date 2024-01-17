import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('book_library')
export class BookLibrary {
  @PrimaryColumn()
  library_register_uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  book_uuid: string;

  @Column()
  state: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
