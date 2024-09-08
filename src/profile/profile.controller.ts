import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { ProfileService } from './profile.service';

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
}
