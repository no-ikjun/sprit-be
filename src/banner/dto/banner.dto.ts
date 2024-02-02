import { IsString } from 'class-validator';

export class NewBannerDto {
  @IsString()
  banner_uuid: string;

  @IsString()
  banner_url: string;

  @IsString()
  click_url: string;
}
