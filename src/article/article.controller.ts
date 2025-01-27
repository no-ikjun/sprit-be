import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Article } from 'src/global/entities/article.entity';
@Controller('v1/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('list')
  @UseGuards(JwtAccessGuard)
  async getArticleList(@Query() query): Promise<Article[]> {
    return this.articleService.getArticleList(query.user_uuid, query.page);
  }

  @Post('like')
  @UseGuards(JwtAccessGuard)
  async likeArticle(@Query() query): Promise<void> {
    return this.articleService.likeArticle(query.article_uuid, query.user_uuid);
  }

  @Post('unlike')
  @UseGuards(JwtAccessGuard)
  async unlikeArticle(@Query() query): Promise<void> {
    return this.articleService.unlikeArticle(
      query.article_uuid,
      query.user_uuid,
    );
  }

  @Get('like-count')
  @UseGuards(JwtAccessGuard)
  async getLikeCount(@Query() query): Promise<number> {
    return this.articleService.getLikeCount(query.article_uuid);
  }

  @Get('is-liked')
  @UseGuards(JwtAccessGuard)
  async isLiked(@Query() query): Promise<boolean> {
    return this.articleService.checkLikeArticle(
      query.article_uuid,
      query.user_uuid,
    );
  }
}
