import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { ReviewCreatedEvent } from 'src/review/dto/review.dto';
import { In, Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  private processingPromises = new Map<string, Promise<Article>>();

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleLike)
    private readonly articleLikeRepository: Repository<ArticleLike>,
    private readonly followService: FollowService,
  ) {}

  @OnEvent('review.created', { async: true })
  async handleReviewCreatedEvent(event: ReviewCreatedEvent) {
    await this.setNewArticle(
      event.user_uuid,
      event.book_uuid,
      event.type,
      event.data,
    );
    await this.cleanUpDuplicateArticles(event);
  }

  async setNewArticle(
    user_uuid: string,
    book_uuid: string,
    type: string,
    data?: string,
  ): Promise<Article> {
    const article = new Article();
    article.article_uuid = generateRamdomId(
      'AT' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    article.user_uuid = user_uuid;
    article.book_uuid = book_uuid;
    article.type = type;
    article.data = data ?? '';
    article.created_at = new Date();
    try {
      return await this.articleRepository.save(article);
    } catch (error) {
      throw new Error('Failed to save article');
    }
  }

  async cleanUpDuplicateArticles(event: ReviewCreatedEvent): Promise<void> {
    const duplicates = await this.articleRepository.find({
      where: {
        user_uuid: event.user_uuid,
        book_uuid: event.book_uuid,
        type: event.type,
        data: event.data,
      },
      order: { created_at: 'DESC' }, // 가장 최신 데이터를 남기기 위해 정렬
    });

    // 2. 중복된 데이터가 2개 이상인 경우 삭제
    if (duplicates.length > 1) {
      // 최신 항목 하나만 남기고 나머지 삭제
      const articlesToDelete = duplicates.slice(1); // 첫 번째 항목 제외
      await this.articleRepository.remove(articlesToDelete);
    }
  }

  async getArticleByArticleUuid(article_uuid: string): Promise<Article> {
    return await this.articleRepository.findOne({
      where: { article_uuid },
    });
  }

  async getArticleList(user_uuid: string, page = 1): Promise<Article[]> {
    const followings = await this.followService.getFollowingList(user_uuid);
    const followingUuids = followings.map((f) => f.user_uuid);

    if (followingUuids.length === 0) return [];

    return this.articleRepository.find({
      where: {
        user_uuid: In(followingUuids),
      },
      order: {
        created_at: 'DESC',
      },
      take: 10,
      skip: (page - 1) * 10,
    });
  }

  async getArticleByUser(user_uuid: string, page = 1): Promise<Article[]> {
    return await this.articleRepository.find({
      where: { user_uuid },
      order: { created_at: 'DESC' },
      take: 10,
      skip: (page - 1) * 10,
    });
  }

  async getLikeCount(article_uuid: string): Promise<number> {
    return await this.articleLikeRepository.count({ where: { article_uuid } });
  }

  async likeArticle(article_uuid: string, user_uuid: string): Promise<void> {
    const article = await this.getArticleByArticleUuid(article_uuid);
    if (!article) {
      throw new Error(`Article with article_uuid ${article_uuid} not found`);
    }
    const like = new ArticleLike();
    like.article_uuid = article_uuid;
    like.user_uuid = user_uuid;
    like.created_at = new Date();
    await this.articleLikeRepository.save(like);
  }

  async unlikeArticle(article_uuid: string, user_uuid: string): Promise<void> {
    const article = await this.getArticleByArticleUuid(article_uuid);
    if (!article) {
      throw new Error(`Article with article_uuid ${article_uuid} not found`);
    }
    await this.articleLikeRepository.delete({
      article_uuid,
      user_uuid,
    });
  }

  async checkLikeArticle(
    article_uuid: string,
    user_uuid: string,
  ): Promise<boolean> {
    const like = await this.articleLikeRepository.findOne({
      where: { article_uuid, user_uuid },
    });
    return !!like;
  }
}
