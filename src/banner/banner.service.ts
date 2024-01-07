import { Injectable } from '@nestjs/common';
import { Banner } from 'src/global/entities/banner.entity';
import { DataSource } from 'typeorm';
import { NewBannerDto } from './dto/banner.dto';
import { BannerRegisterResponseType } from 'src/global/types/response.type';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';

@Injectable()
export class BannerService {
  constructor(private readonly dataSource: DataSource) {}

  async getBannerList(): Promise<Banner[]> {
    let bannerList: Banner[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      bannerList = await transctionEntityManager.find(Banner);
    });
    return bannerList;
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
    banner_data.background_color = banner.background_color;
    banner_data.title = banner.title;
    banner_data.content = banner.content;
    banner_data.icon_url = banner.icon_url;
    banner_data.created_at = new Date();
    banner_data.click_url = banner.click_url;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      await transctionEntityManager.save(Banner, banner_data);
    });
    return { message: 'success' };
  }
}
