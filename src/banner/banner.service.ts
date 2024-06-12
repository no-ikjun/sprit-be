import { Injectable } from '@nestjs/common';
import { Banner } from 'src/global/entities/banner.entity';
import { Repository } from 'typeorm';
import { NewBannerDto } from './dto/banner.dto';
import { BannerRegisterResponseType } from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async getBannerList(): Promise<Banner[]> {
    return await this.bannerRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async setNewBanner(
    banner: NewBannerDto,
  ): Promise<BannerRegisterResponseType> {
    const banner_data = new Banner();
    const banner_uuid = generateRamdomId(
      'BA' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    banner_data.banner_uuid = banner_uuid;
    banner_data.banner_url = banner.banner_url;
    banner_data.created_at = new Date();
    banner_data.click_url = banner.click_url;
    await this.bannerRepository.save(banner_data);
    return { message: 'success' };
  }
}
