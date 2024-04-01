import { Injectable } from '@nestjs/common';
import { Version } from 'src/global/entities/version.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { DataSource } from 'typeorm';

@Injectable()
export class VersionRepository {
  constructor(private readonly dataSource: DataSource) {}

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
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await transactionEntityManager.save(Version, {
        version_uuid: version_uuid,
        version_number: versionNumber,
        build_number: buildNumber,
        update_required: updateRequired,
        description: description,
        created_at: new Date(),
      });
    });
  }

  async getLatestVersion(): Promise<Version> {
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await transactionEntityManager.findOne(Version, {
          order: { created_at: 'DESC' },
          where: {},
        });
      },
    );
  }
}
