import { IsString } from 'class-validator';

export class FollowDto {
  @IsString()
  follower_uuid: string;

  @IsString()
  followee_uuid: string;
}
