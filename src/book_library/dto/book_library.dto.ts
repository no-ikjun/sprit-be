import { IsString } from 'class-validator';

export class RegisterLibraryDto {
  @IsString()
  book_uuid: string;

  @IsString()
  state: string;
}
