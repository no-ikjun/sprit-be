import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from 'src/global/entities/follow.entity';
import { User } from 'src/global/entities/user.entity';
import { ProfileResponseType } from 'src/global/types/response.type';
import { ProfileRepository } from 'src/profile/profile.repository';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly profileRepository: ProfileRepository,
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

  async getFollowingList(
    follower_uuid: string,
  ): Promise<ProfileResponseType[]> {
    const followings = await this.followRepository.find({
      where: { follower: { user_uuid: follower_uuid } },
      relations: ['followee'],
    });

    const result = await Promise.all(
      followings.map(async (follow) => {
        const profile = await this.profileRepository.getProfileByUserUuid(
          follow.followee.user_uuid,
        );
        return {
          user_uuid: follow.followee.user_uuid,
          nickname: follow.followee.user_nickname,
          image: profile.image,
          description: profile.description,
          recommend_list: [],
          // recommend_list: profile.recommend_list.map((recommendBook) => {
          //   return recommendBook.book.book_uuid;
          // }),
        };
      }),
    );

    return result;
  }

  async getFollowerList(user_uuid: string): Promise<ProfileResponseType[]> {
    const followers = await this.followRepository.find({
      where: { followee: { user_uuid } },
      relations: ['follower'],
    });
    const result = await Promise.all(
      followers.map(async (follow) => {
        const profile = await this.profileRepository.getProfileByUserUuid(
          follow.follower.user_uuid,
        );
        return {
          user_uuid: follow.follower.user_uuid,
          nickname: follow.follower.user_nickname,
          image: profile.image,
          description: profile.description,
          recommend_list: [],
          // recommend_list: profile.recommend_list.map((recommendBook) => {
          //   return recommendBook.book.book_uuid;
          // }),
        };
      }),
    );

    return result;
  }
}
