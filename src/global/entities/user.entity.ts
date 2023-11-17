import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryColumn()
  user_uuid: string;

  @Column()
  user_nickname: string;

  @Column({ unique: true })
  user_id: string;

  @Column()
  user_password: string;

  @Column()
  register_type: string;
}
