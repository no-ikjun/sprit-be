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
}
