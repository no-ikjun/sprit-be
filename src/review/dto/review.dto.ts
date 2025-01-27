import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  score: number;

  @IsString()
  book_uuid: string;

  @IsString()
  content: string;
}

export class ReviewCreatedEvent {
  user_uuid: string;
  book_uuid: string;
  type: string;
  data: string;
}
