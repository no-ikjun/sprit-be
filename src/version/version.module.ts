import { Module } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { VersionRepository } from './version.repository';

@Module({
  providers: [VersionService, VersionRepository],
  controllers: [VersionController],
})
export class VersionModule {}
