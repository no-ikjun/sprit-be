import { Injectable } from '@nestjs/common';
import { VersionRepository } from './version.repository';
import { Version } from 'src/global/entities/version.entity';

@Injectable()
export class VersionService {
  constructor(private readonly versionRepository: VersionRepository) {}

  async setNewVersion(
    versionNumber: string,
    buildNumber: string,
    updateRequired: boolean,
    description: string,
  ): Promise<void> {
    await this.versionRepository.setNewVersion(
      versionNumber,
      buildNumber,
      updateRequired,
      description,
    );
  }

  async getLatestVersion(): Promise<Version> {
    return await this.versionRepository.getLatestVersion();
  }
}
