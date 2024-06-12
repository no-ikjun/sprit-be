import { Module, Version } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionController } from './version.controller';
import { VersionRepository } from './version.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Version])],
  providers: [VersionService, VersionRepository],
  controllers: [VersionController],
})
export class VersionModule {}
