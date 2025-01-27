import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { Article } from 'src/global/entities/article.entity';
import { FetchArticleDto } from './dto/article.dto';

@Controller('v1/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('list')
  @UseGuards(JwtAccessGuard)
  async getArticleList(@Body() body: FetchArticleDto): Promise<Article[]> {
    return this.articleService.getArticleList(body.user_uuid, body.page);
  }
}
