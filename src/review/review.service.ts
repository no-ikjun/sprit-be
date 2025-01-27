import { Injectable } from '@nestjs/common';
import { Review } from 'src/global/entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/review.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { UserService } from 'src/user/user.service';
import { UserInfoDto } from 'src/user/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReviewService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>, // private readonly articleService: ArticleService,
  ) {}

  async getReviewByBookUuid(book_uuid: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { book: { book_uuid } },
      relations: ['book'],
    });
  }

  async getReviewByUserUuid(user_uuid: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { user_uuid },
    });
  }

  async getReviewByReviewUuid(review_uuid: string): Promise<Review> {
    return await this.reviewRepository.findOne({
      where: { review_uuid },
    });
  }

  async setNewReview(
    reviewData: CreateReviewDto,
    access_token: string,
  ): Promise<Review> {
    const review_uuid = generateRamdomId(
      'RE' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );

    const userInfo: UserInfoDto = await this.userService.getUserInfo(
      access_token,
    );

    // await this.articleService.setNewArticle(
    //   userInfo.user_uuid,
    //   reviewData.book_uuid,
    //   'review',
    //   JSON.stringify({ score: reviewData.score, content: reviewData.content }),
    // );

    try {
      const review = this.reviewRepository.create({
        review_uuid: review_uuid,
        score: reviewData.score,
        created_at: new Date(),
        user_uuid: userInfo.user_uuid,
        content: reviewData.content ?? '',
        book: { book_uuid: reviewData.book_uuid },
      });
      return await this.reviewRepository.save(review);
    } catch (error) {
      console.error('Error when saving review:', error);
      throw error;
    }
  }

  async getAverageScoreByBookUuid(book_uuid: string): Promise<number> {
    const averageScoreResult = await this.reviewRepository
      .createQueryBuilder()
      .select('AVG(score)', 'average')
      .where('book_uuid = :book_uuid', { book_uuid })
      .getRawOne();
    return averageScoreResult && averageScoreResult.average !== null
      ? parseFloat(averageScoreResult.average)
      : 0;
  }

  async getReviewCountByBookUuid(book_uuid: string): Promise<number> {
    const reviewCountResult = await this.reviewRepository
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .where('book_uuid = :book_uuid', { book_uuid })
      .getRawOne();
    return reviewCountResult && reviewCountResult.count !== null
      ? parseInt(reviewCountResult.count)
      : 0;
  }
}
