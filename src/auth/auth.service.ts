import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { KakaoRequestDto, KakaoUserDataDto } from './dto/auth.dto';
import { LoginResponseType } from 'src/global/types/response.type';
import { AxiosResponse } from 'axios';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { UserRegisterType } from 'src/global/types/user.enum';
import { User } from 'src/global/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  async kakaoLogin(data: KakaoRequestDto): Promise<LoginResponseType> {
    const kakaoUserData: KakaoUserDataDto = await this.getKaKaoUserData(
      data.accessToken,
    );
    return await this.dataSource.transaction(
      async (transctionEntityManager) => {
        const user = await this.userService.findByUserId(kakaoUserData.user_id);
        if (user) {
          const accessToken = await this.getJwtAccessToken(
            user.user_id,
            UserRegisterType.KAKAO,
          );
          return { access_token: accessToken, new_user: false };
        } else {
          await this.verifyDuplicateUser(kakaoUserData.user_id);
          await this.userRepository.setNewUserByKakao(
            transctionEntityManager,
            kakaoUserData,
          );
          const access_token = await this.getJwtAccessToken(
            kakaoUserData.user_id,
            UserRegisterType.KAKAO,
          );
          return { access_token: access_token, new_user: true };
        }
      },
    );
  }

  public async getKaKaoUserData(
    kakao_access_token: string,
  ): Promise<KakaoUserDataDto> {
    const response = await lastValueFrom(
      this.httpService
        .get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${kakao_access_token}`,
          },
        })
        .pipe(map((response: AxiosResponse<any>) => response.data)),
    ).catch(() => {
      throw new HttpException(
        'Failed get Kakao user data',
        HttpStatus.BAD_REQUEST,
      );
    });
    return {
      user_id: response.id,
      user_nickname: response.properties.nickname,
    };
  }

  public async getJwtAccessToken(
    user_id: string,
    login_type: UserRegisterType,
  ): Promise<string> {
    const payload = { user_id: user_id, login_type: login_type };
    const jwtAccessTokenSecret = this.configService.get(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    const jwtAccessTokenExpire = this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    );
    return this.jwtService.sign(payload, {
      secret: jwtAccessTokenSecret,
      expiresIn: jwtAccessTokenExpire,
    });
  }

  private async verifyDuplicateUser(user_id: string): Promise<User> {
    const user = await this.userService.findByUserId(user_id);
    if (user) {
      throw new HttpException(
        '이미 존재하는 아이디입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  protected async generateAccessToken(userUuid: string): Promise<string> {
    return this.jwtService.signAsync({ user_uuid: userUuid });
  }
}
