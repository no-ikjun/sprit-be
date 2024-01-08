import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Review } from 'src/global/entities/review.entity';
import { CreateReviewDto } from './dto/review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @UseGuards(JwtAccessGuard)
  async getReview(@Query() query): Promise<Review[]> {
    return await this.reviewService.getReviewByBookUuid(query.book_uuid);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  async setReview(@Body() body: CreateReviewDto, @Req() req): Promise<Review> {
    const accessToken = req.headers.authorization.split(' ')[1];
    return await this.reviewService.setNewReview(body, accessToken);
  }
}
