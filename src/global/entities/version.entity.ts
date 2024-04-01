import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('version')
export class Version {
  @PrimaryColumn()
  version_uuid: string;

  @Column()
  version_number: string;

  @Column()
  build_number: string;

  @Column()
  update_required: boolean;

  @Column()
  description: string;

  @Column()
  created_at: Date;
}
