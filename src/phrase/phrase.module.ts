import { Module } from '@nestjs/common';
import { PhraseController } from './phrase.controller';
import { PhraseService } from './phrase.service';
import { PhraseRepository } from './phrase.repository';

@Module({
  controllers: [PhraseController],
  providers: [PhraseService, PhraseRepository],
})
export class PhraseModule {}
