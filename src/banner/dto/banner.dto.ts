import { IsString } from 'class-validator';

export class NewBannerDto {
  @IsString()
  banner_uuid: string;

  @IsString()
  background_color: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  icon_url: string;

  @IsString()
  click_url: string;
}
