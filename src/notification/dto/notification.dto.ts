import { IsObject, IsOptional, IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  data?: { [key: string]: string };
}
