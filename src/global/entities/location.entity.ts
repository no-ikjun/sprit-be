import {
  Column,
  Entity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

export type LocationSource =
  | 'official-library'
  | 'naver-local'
  | 'book-cafe'
  | 'park';

@Entity('location')
export class Location {
  @PrimaryColumn('uuid')
  location_uuid: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: '도서관' })
  category: string;

  @Column({ nullable: true, default: '' })
  address: string;

  @Column({ nullable: true, default: '' })
  roadAddress: string;

  @Index('idx_location_lat')
  @Column({ type: 'double precision', nullable: false })
  lat: number;

  @Index('idx_location_lng')
  @Column({ type: 'double precision', nullable: false })
  lng: number;

  @Column({ type: 'double precision', nullable: true, default: 0 })
  x: number;

  @Column({ type: 'double precision', nullable: true, default: 0 })
  y: number;

  @Index('idx_location_source')
  @Column({ nullable: false })
  source: LocationSource;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Index('idx_location_region')
  @Column({ nullable: true, default: '' })
  region: string;

  @Index('idx_location_keyword')
  @Column({ nullable: true, default: '' })
  keyword: string;

  @Index('idx_location_external_id')
  @Column({ nullable: true })
  externalId: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
