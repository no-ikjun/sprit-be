import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'src/global/entities/follow.entity';
import { User } from 'src/global/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async followUser(
    follower_uuid: string,
    followee_uuid: string,
  ): Promise<Follow> {
    const follower = await this.userRepository.findOne({
      where: { user_uuid: follower_uuid },
    });
    const followee = await this.userRepository.findOne({
      where: { user_uuid: followee_uuid },
    });

    if (!follower || !followee) {
      throw new Error('User not found');
    }

    const follow = new Follow();
    follow.follower = follower;
    follow.followee = followee;

    return await this.followRepository.save(follow);
  }

  async unfollowUser(
    follower_uuid: string,
    followee_uuid: string,
  ): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { user_uuid: follower_uuid },
        followee: { user_uuid: followee_uuid },
      },
    });

    if (!follow) {
      throw new Error('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }

  async isFollowing(
    follower_uuid: string,
    followee_uuid: string,
  ): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { user_uuid: follower_uuid },
        followee: { user_uuid: followee_uuid },
      },
    });

    return !!follow;
  }

  async getFollowingList(follower_uuid: string): Promise<string[]> {
    const followings = await this.followRepository.find({
      where: { follower: { user_uuid: follower_uuid } },
      relations: ['followee'],
    });

    return followings.map((follow) => follow.followee.user_uuid);
  }

  async getFollowerList(user_uuid: string): Promise<string[]> {
    const followers = await this.followRepository.find({
      where: { followee: { user_uuid } },
      relations: ['follower'],
    });

    return followers.map((follow) => follow.follower.user_uuid);
  }
}
