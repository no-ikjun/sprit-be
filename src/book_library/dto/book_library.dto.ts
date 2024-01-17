import { IsString } from 'class-validator';

export class RegisterLibraryDto {
  @IsString()
  user_uuid: string;

  @IsString()
  book_uuid: string;

  @IsString()
  status: string;
}
