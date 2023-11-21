import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  user_id: string;

  @IsString()
  user_password: string;
}

export class KakaoRequestDto {
  @IsString()
  access_token: string;

  @IsString()
  expires_at: string;

  @IsString()
  refresh_token: string;

  @IsString()
  refresh_token_expires_at: string;

  @IsString()
  id_token: string;
}

export class KakaoUserDataDto {
  @ApiProperty({
    example: '123456789',
    description: '카카오 회원번호',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    example: '홍길동',
    description: '카카오 닉네임',
  })
  @IsString()
  user_nickname: string;
}

export class AppleRequestDto {
  @IsString()
  user_identifier: string;

  @IsString()
  given_name: string;

  @IsString()
  family_name: string;

  @IsString()
  authorization_code: string;

  @IsString()
  email: string;

  @IsString()
  identity_token: string;
}
