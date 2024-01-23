import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PhraseService } from './phrase.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { NewPhraseDto } from './dto/phrase.dto';

@Controller('phrase')
export class PhraseController {
  constructor(private readonly phraseService: PhraseService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setPhrase(@Req() req, @Body() body: NewPhraseDto) {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.setPhrase(body, access_token);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getPhrasesByUserUuid(@Req() req) {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.getPhrasesByUserUuid(access_token);
  }

  @Get('find')
  @UseGuards(JwtAccessGuard)
  async getPhraseByPhraseUuid(@Query() query) {
    return await this.phraseService.getPhraseByPhraseUuid(query.phrase_uuid);
  }

  @Patch('remind')
  @UseGuards(JwtAccessGuard)
  async updatePhraseRemind(@Query() query) {
    await this.phraseService.updatePhraseRemind(
      query.phrase_uuid,
      JSON.parse(query.remind),
    );
  }
}
