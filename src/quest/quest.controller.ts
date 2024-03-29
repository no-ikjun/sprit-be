import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { CreateQuestDto } from './dto/quest.dto';
import { Quest } from 'src/global/entities/quest.entity';
import { QuestApply } from 'src/global/entities/quest_apply.entity';
import { AppliedQuestResponseType } from 'src/global/types/response.type';

@Controller('v1/quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setNewQuest(@Body() body: CreateQuestDto): Promise<Quest> {
    return await this.questService.setNewQuest(body);
  }

  @Get('find')
  @UseGuards(JwtAccessGuard)
  async getQuestByUuid(@Query() query): Promise<Quest> {
    return await this.questService.findQuestByUuid(query.quest_uuid);
  }

  @Get('active')
  @UseGuards(JwtAccessGuard)
  async getActiveQuests(): Promise<Quest[]> {
    return await this.questService.getActiveQuests();
  }

  @Get('ended')
  @UseGuards(JwtAccessGuard)
  async getEndedQuests(): Promise<Quest[]> {
    return await this.questService.getEndedQuests();
  }

  @Post('apply')
  @UseGuards(JwtAccessGuard)
  async applyQuest(@Query() query, @Req() req): Promise<QuestApply> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.questService.applyQuest(
      access_token,
      query.quest_uuid,
      query.phone_number,
    );
  }

  @Get('my/active')
  @UseGuards(JwtAccessGuard)
  async getMyQuest(@Req() req): Promise<AppliedQuestResponseType[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.questService.getMyActiveQuests(access_token);
  }

  @Get('my/all')
  @UseGuards(JwtAccessGuard)
  async getMyAllQuest(@Req() req): Promise<AppliedQuestResponseType[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.questService.getMyAllQuests(access_token);
  }

  @Get('find/apply')
  @UseGuards(JwtAccessGuard)
  async findQuestApply(@Query() query, @Req() req): Promise<QuestApply> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.questService.findQuestApplyByQuestUuid(
      access_token,
      query.quest_uuid,
    );
  }
}
