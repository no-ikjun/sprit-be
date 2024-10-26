import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { FollowDto } from './dto/follow.dto';

@Controller('v1/follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAccessGuard)
  @Post()
  async followUser(@Body() body: FollowDto) {
    return await this.followService.followUser(
      body.follower_uuid,
      body.followee_uuid,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Post('cancel')
  async unfollowUser(@Body() body: FollowDto) {
    return await this.followService.unfollowUser(
      body.follower_uuid,
      body.followee_uuid,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Get('check')
  async isFollowing(@Body() body: FollowDto) {
    return await this.followService.isFollowing(
      body.follower_uuid,
      body.followee_uuid,
    );
  }

  @UseGuards(JwtAccessGuard)
  @Get('followers')
  async getFollowers(@Query() query) {
    return await this.followService.getFollowerList(query.user_uuid);
  }

  @UseGuards(JwtAccessGuard)
  @Get('followings')
  async getFollowing(@Query() query) {
    return await this.followService.getFollowingList(query.user_uuid);
  }
}
