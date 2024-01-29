import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { ConfigService } from '@nestjs/config';
import { cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class GlobalFcmService {
  constructor(private readonly configService: ConfigService) {
    initializeApp({
      credential: cert({
        projectId: this.configService.get<string>('FCM_PROJECT_ID'),
        privateKey: this.configService
          .get<string>('FCM_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        clientEmail: this.configService.get<string>('FCM_CLIENT_EMAIL'),
      }),
    });
  }

  postMessage(
    title: string,
    body: string,
    imageUrl: string,
    token: string,
    sound = 'default',
    data?: { [key: string]: string },
  ) {
    getMessaging()
      .send({
        notification: {
          title,
          body,
          imageUrl,
        },
        android: {
          notification: { sound },
        },
        apns: {
          payload: { aps: { sound } },
        },
        token,
        data,
      })
      .then((response) => {
        //console.log(response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }
}
