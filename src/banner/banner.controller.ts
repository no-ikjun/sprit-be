import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Banner } from 'src/global/entities/banner.entity';
import { BannerRegisterResponseType } from 'src/global/types/response.type';
import { NewBannerDto } from './dto/banner.dto';

@Controller('v1/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @UseGuards(JwtAccessGuard)
  async getBannerList(): Promise<Banner[]> {
    return await this.bannerService.getBannerList();
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNewBanner(
    @Body() body: NewBannerDto,
  ): Promise<BannerRegisterResponseType> {
    return await this.bannerService.setNewBanner(body);
  }
}
