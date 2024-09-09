import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('version')
export class Version {
  @PrimaryColumn({ nullable: false })
  version_uuid: string;

  @Column({ nullable: false })
  version_number: string;

  @Column({ nullable: false })
  build_number: string;

  @Column({ nullable: false })
  update_required: boolean;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
