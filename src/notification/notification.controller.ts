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
import { NotificationService } from './notification.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import {
  MessageResponseType,
  SetFcmTokenResponseType,
} from 'src/global/types/response.type';
import { TimeAgree } from 'src/global/entities/time_agree.entity';
import { RemindAgree } from 'src/global/entities/remind_agree.entity';
import { QuestAgree } from 'src/global/entities/quest_agree.entity';
import { NotificationDto } from './dto/notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register')
  @UseGuards(JwtAccessGuard)
  async setFcmToken(
    @Req() req,
    @Query() query,
  ): Promise<SetFcmTokenResponseType> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.notificationService.setFcmToken(
      access_token,
      query.fcm_token,
    );
  }

  @Get('agree/marketing')
  @UseGuards(JwtAccessGuard)
  async getMarketingAgree(@Query() query): Promise<boolean> {
    return await this.notificationService.getMarketingAgree(query.fcm_token);
  }
  @Patch('agree/marketing')
  @UseGuards(JwtAccessGuard)
  async updateMarketingAgree(@Query() query): Promise<void> {
    return await this.notificationService.updateMarketingAgree(
      query.fcm_token,
      JSON.parse(query.marketing_agree),
    );
  }

  @Get('agree/time')
  @UseGuards(JwtAccessGuard)
  async getTimeAgree(@Query() query): Promise<TimeAgree> {
    return await this.notificationService.getTimeAgree(query.fcm_token);
  }
  @Get('agree/remind')
  @UseGuards(JwtAccessGuard)
  async getRemindAgree(@Query() query): Promise<RemindAgree> {
    return await this.notificationService.getRemindAgree(query.fcm_token);
  }
  @Get('agree/quest')
  @UseGuards(JwtAccessGuard)
  async getQuestAgree(@Query() query): Promise<QuestAgree> {
    return await this.notificationService.getQuestAgree(query.fcm_token);
  }

  @Patch('agree/time')
  @UseGuards(JwtAccessGuard)
  async updateTimeAgree(@Query() query): Promise<void> {
    return await this.notificationService.updateTimeAgree(
      query.fcm_token,
      JSON.parse(query.agree_01),
      JSON.parse(query.time_01),
      JSON.parse(query.agree_02),
    );
  }
  @Patch('agree/time/only')
  @UseGuards(JwtAccessGuard)
  async updateOnlyTime(@Query() query): Promise<void> {
    return await this.notificationService.updateOnlyTime(
      query.fcm_token,
      JSON.parse(query.time_01),
    );
  }
  @Patch('agree/remind')
  @UseGuards(JwtAccessGuard)
  async updateRemindAgree(@Query() query): Promise<void> {
    return await this.notificationService.updateRemindAgree(
      query.fcm_token,
      JSON.parse(query.agree_01),
      JSON.parse(query.time_01),
    );
  }
  @Patch('agree/quest')
  @UseGuards(JwtAccessGuard)
  async updateQuestAgree(@Query() query): Promise<void> {
    return await this.notificationService.updateQuestAgree(
      query.fcm_token,
      JSON.parse(query.agree_01),
      JSON.parse(query.agree_02),
      JSON.parse(query.agree_03),
    );
  }

  @Post('send/user')
  @UseGuards(JwtAccessGuard)
  async sendMessageByUserUuid(
    @Query('user_uuid') user_uuid: string,
    @Body() data: NotificationDto,
  ): Promise<MessageResponseType> {
    await this.notificationService.sendMessageByUserUuid(
      user_uuid,
      data.title,
      data.body,
      data.data,
    );
    return { message: 'success' };
  }

  @Post('send/token')
  @UseGuards(JwtAccessGuard)
  async sendMessageByFcmToken(
    @Query('fcm_token') fcm_token: string,
    @Body() data: NotificationDto,
  ): Promise<MessageResponseType> {
    await this.notificationService.sendMessageByFcmToken(
      fcm_token,
      data.title,
      data.body,
      data.data,
    );
    return { message: 'success' };
  }

  @Post('send/all/marketing')
  @UseGuards(JwtAccessGuard)
  async sendMessageAllMarketing(
    @Body() data: NotificationDto,
  ): Promise<MessageResponseType> {
    await this.notificationService.sendMarketingMessage(
      data.title,
      data.body,
      data.data,
    );
    return { message: 'success' };
  }
}
