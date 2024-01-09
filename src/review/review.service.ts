import { Injectable } from '@nestjs/common';
import { Review } from 'src/global/entities/review.entity';
import { DataSource } from 'typeorm';
import { CreateReviewDto } from './dto/review.dto';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { UserService } from 'src/user/user.service';
import { UserInfoDto } from 'src/user/dto/user.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async getReviewByBookUuid(book_uuid: string): Promise<Review[]> {
    let reviews: Review[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      reviews = await transctionEntityManager.find(Review, {
        where: { book: { book_uuid } },
        relations: ['book'],
      });
    });
    return reviews;
  }

  async getReviewByUserUuid(user_uuid: string): Promise<Review[]> {
    let reviews: Review[];
    await this.dataSource.transaction(async (transctionEntityManager) => {
      reviews = await transctionEntityManager.find(Review, {
        where: { user_uuid: user_uuid },
      });
    });
    return reviews;
  }

  async getReviewByReviewUuid(review_uuid: string): Promise<Review> {
    let review: Review;
    await this.dataSource.transaction(async (transctionEntityManager) => {
      review = await transctionEntityManager.findOne(Review, {
        where: { review_uuid: review_uuid },
      });
    });
    return review;
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

    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        try {
          const review = transactionEntityManager.create(Review, {
            review_uuid: review_uuid,
            score: reviewData.score,
            created_at: new Date(),
            user_uuid: userInfo.user_uuid,
            content: reviewData.content ?? '',
            book: { book_uuid: reviewData.book_uuid },
          });
          return await transactionEntityManager.save(review);
        } catch (error) {
          console.error('Error when saving review:', error);
          throw error; // Or handle the error as appropriate for your application
        }
      },
    );
  }

  async getAverageScoreByBookUuid(book_uuid: string): Promise<number> {
    const averageScoreResult = await this.dataSource
      .createQueryBuilder()
      .select('AVG(score)', 'average')
      .from(Review, 'review')
      .where('review.book_uuid = :book_uuid', { book_uuid })
      .getRawOne();
    return averageScoreResult && averageScoreResult.average !== null
      ? parseFloat(averageScoreResult.average)
      : 0;
  }

  async getReviewCountByBookUuid(book_uuid: string): Promise<number> {
    const reviewCountResult = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(Review, 'review')
      .where('review.book_uuid = :book_uuid', { book_uuid })
      .getRawOne();
    return reviewCountResult && reviewCountResult.count !== null
      ? parseInt(reviewCountResult.count)
      : 0;
  }
}
