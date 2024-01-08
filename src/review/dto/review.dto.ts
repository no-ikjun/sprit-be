import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  score: number;

  @IsString()
  book_uuid: string;
}
