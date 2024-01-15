import { Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { SetFcmTokenResponseType } from 'src/global/types/response.type';

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
}
