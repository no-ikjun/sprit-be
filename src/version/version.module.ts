import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { VersionRepository } from './version.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Version } from 'src/global/entities/version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Version])],
  providers: [VersionService, VersionRepository],
  controllers: [VersionController],
})
export class VersionModule {}
