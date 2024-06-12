import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Version } from 'src/global/entities/version.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class VersionRepository {
  constructor(
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
  ) {}

  async setNewVersion(
    versionNumber: string,
    buildNumber: string,
    updateRequired: boolean,
    description: string,
  ): Promise<void> {
    const version_uuid = generateRamdomId(
      'VE' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    await this.versionRepository.save({
      version_uuid: version_uuid,
      version_number: versionNumber,
      build_number: buildNumber,
      update_required: updateRequired,
      description: description,
      created_at: new Date(),
    });
  }

  async getLatestVersion(): Promise<Version> {
    return await this.versionRepository.findOne({
      order: { created_at: 'DESC' },
      where: {},
    });
  }
}
