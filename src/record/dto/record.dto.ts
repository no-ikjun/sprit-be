import { IsDate, IsNumber, IsString } from 'class-validator';

export class NewRecordDto {
  @IsString()
  book_uuid: string;

  @IsString()
  goal_type: string;

  @IsNumber()
  goal_scale: number;

  @IsNumber()
  page_start: number;
}

export class AddRecordDto {
  @IsString()
  book_uuid: string;

  @IsString()
  goal_type: string;

  @IsNumber()
  read_time: number;

  @IsNumber()
  page_start: number;

  @IsNumber()
  page_end: number;

  @IsDate()
  start_time: Date;

  @IsDate()
  end_time: Date;
}
