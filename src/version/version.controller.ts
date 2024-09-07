import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VersionService } from './version.service';
import { CreateVersionDto } from './dto/version.dto';
import { Version } from 'src/global/entities/version.entity';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';

@Controller('v1/version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNewVersion(@Body() body: CreateVersionDto): Promise<void> {
    await this.versionService.setNewVersion(
      body.version_number,
      body.build_number,
      body.update_required,
      body.description,
    );
  }

  @Get()
  @UseGuards(JwtAccessGuard)
  async getLatestVersion(): Promise<Version> {
    return await this.versionService.getLatestVersion();
  }
}
