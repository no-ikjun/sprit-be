import {
  Body,
  Controller,
  Delete,
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
import { Phrase } from 'src/global/entities/phrase.entity';
import {
  LibraryPhraseResponseType,
  LibraryPhraseResponseTypeV2,
} from 'src/global/types/response.type';

@Controller('v1/phrase')
export class PhraseController {
  constructor(private readonly phraseService: PhraseService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setPhrase(@Req() req, @Body() body: NewPhraseDto): Promise<string> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.setPhrase(body, access_token);
  }

  @Patch()
  @UseGuards(JwtAccessGuard)
  async updatePhrase(@Query() query): Promise<void> {
    await this.phraseService.updatePhrase(query.phrase_uuid, query.phrase);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getPhrasesByUserUuid(@Req() req): Promise<Phrase[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.getPhrasesByUserUuid(access_token);
  }

  @Get('find')
  @UseGuards(JwtAccessGuard)
  async getPhraseByPhraseUuid(@Query() query): Promise<Phrase> {
    return await this.phraseService.getPhraseByPhraseUuid(query.phrase_uuid);
  }

  @Patch('remind')
  @UseGuards(JwtAccessGuard)
  async updatePhraseRemind(@Query() query): Promise<void> {
    await this.phraseService.updatePhraseRemind(
      query.phrase_uuid,
      JSON.parse(query.remind),
    );
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deletePhrase(@Query() query): Promise<void> {
    await this.phraseService.deletePhrase(query.phrase_uuid);
  }

  @Get('library')
  @UseGuards(JwtAccessGuard)
  async getPhrasesByBookUuid(
    @Req() req,
    @Query() query,
  ): Promise<LibraryPhraseResponseType> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.getPhrasesForLibrary(
      access_token,
      JSON.parse(query.page) ?? 1,
    );
  }

  @Get('library/screen')
  @UseGuards(JwtAccessGuard)
  async getPhrasesByBookUuidV2(@Req() req): Promise<LibraryPhraseResponseType> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.getPhrasesForLibraryScreen(access_token);
  }

  @Get('library/all')
  @UseGuards(JwtAccessGuard)
  async getPhrases(
    @Req() req,
    @Query() query,
  ): Promise<LibraryPhraseResponseTypeV2> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.phraseService.getPhrasesForLibraryV2(
      access_token,
      JSON.parse(query.page) ?? 1,
    );
  }
}
