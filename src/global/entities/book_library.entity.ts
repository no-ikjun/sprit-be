import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('book_library')
export class BookLibrary {
  @PrimaryColumn({ nullable: false })
  library_register_uuid: string;

  @Column({ nullable: false })
  user_uuid: string;

  @Column({ nullable: false })
  book_uuid: string;

  @Column({ nullable: false })
  state: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
