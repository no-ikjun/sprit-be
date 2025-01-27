import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class NewPhraseDto {
  @IsString()
  book_uuid: string;

  @IsString()
  phrase: string;

  @IsNumber()
  page: number;

  @IsBoolean()
  remind: boolean;

  @IsBoolean()
  @Transform(({ value }) => value ?? false)
  share?: boolean;
}
