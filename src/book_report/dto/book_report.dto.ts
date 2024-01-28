import { IsString } from 'class-validator';

export class NewBookReportDto {
  @IsString()
  book_uuid: string;

  @IsString()
  report: string;
}

export class UpdateBookReportDto {
  @IsString()
  book_report_uuid: string;

  @IsString()
  report: string;
}
