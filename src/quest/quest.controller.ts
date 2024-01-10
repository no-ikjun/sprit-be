import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { CreateQuestDto } from './dto/quest.dto';
import { Quest } from 'src/global/entities/quest.entity';

@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNewQuest(@Body() body: CreateQuestDto): Promise<Quest> {
    return await this.questService.setNewQuest(body);
  }

  @Get('/active')
  @UseGuards(JwtAccessGuard)
  async getActiveQuests(): Promise<Quest[]> {
    return await this.questService.getActiveQuests();
  }

  @Get('/ended')
  @UseGuards(JwtAccessGuard)
  async getEndedQuests(): Promise<Quest[]> {
    return await this.questService.getEndedQuests();
  }
}
