import { IsNumber, IsString } from 'class-validator';

export class CreateQuestDto {
  @IsString()
  title: string;

  @IsString()
  short_description: string;

  @IsString()
  long_description: string;

  @IsString()
  icon_url: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;

  @IsNumber()
  limit: number;
}
