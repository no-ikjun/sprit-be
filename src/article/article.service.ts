import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { Article } from 'src/global/entities/article.entity';
import { ArticleLike } from 'src/global/entities/article_like.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { Repository } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleLike)
    private readonly articleLikeRepository: Repository<ArticleLike>,
    private readonly followService: FollowService,
  ) {}

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
    return await this.articleRepository.save(article);
  }

  async getArticleByArticleUuid(article_uuid: string): Promise<Article> {
    return await this.articleRepository.findOne({
      where: { article_uuid },
    });
  }

  async getArticleList(user_uuid: string, page = 1): Promise<Article[]> {
    const followings = await this.followService.getFollowingList(user_uuid);
    const articles = [];

    for (const following_uuid of followings.map((f) => f.user_uuid)) {
      const article = await this.articleRepository.find({
        where: { user_uuid: following_uuid },
        order: { created_at: 'DESC' }, // 최신순 정렬
        take: 10, // 페이지당 10개 제한
        skip: (page - 1) * 10, // 페이지 계산
      });
      articles.push(...article);
    }

    return articles;
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
