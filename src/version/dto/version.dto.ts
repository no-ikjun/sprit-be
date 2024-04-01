import { IsBoolean, IsString } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  version_number: string;

  @IsString()
  build_number: string;

  @IsBoolean()
  update_required: boolean;

  @IsString()
  description: string;
}
