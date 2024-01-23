import { IsBoolean, IsString } from 'class-validator';

export class NewPhraseDto {
  @IsString()
  book_uuid: string;

  @IsString()
  phrase: string;

  @IsBoolean()
  remind: boolean;
}
