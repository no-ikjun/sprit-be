import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { ProfileService } from './profile.service';
import { ProfileResponseType } from 'src/global/types/response.type';

@Controller('v1/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAccessGuard)
  @Post()
  async uploadProfileImage(@Req() req, @Res() res) {
    try {
      await this.profileService.fileUpload(req, res);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @UseGuards(JwtAccessGuard)
  @Patch('desc')
  async updateProfileDesc(@Body() body) {
    return await this.profileService.updateProfileDesc(
      body.user_uuid,
      body.desc,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Get()
  async getProfile(@Query() query): Promise<ProfileResponseType> {
    return await this.profileService.getProfile(query.user_uuid);
  }
}
