import { IsNumber, IsString } from 'class-validator';

export class NewRecordDto {
  @IsString()
  book_uuid: string;

  @IsString()
  goal_type: string;

  @IsNumber()
  goal_scale: number;
}
