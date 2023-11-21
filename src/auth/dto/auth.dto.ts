import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class KakaoRequestDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V4YW1wbGUuYXV0aDAuY29tLyIsImF1ZCI6Imh0dHBzOi8vYXBpLmV4YW1wbGUuY29tL2NhbGFuZGFyL3YxLyIsInN1YiI6InVzcl8xMjMiLCJpYXQiOjE0NTg3ODU3OTYsImV4cCI6MTQ1ODg3MjE5Nn0.CA7eaHjIHz5NxeIJoFK9krqaeZrPLwmMmgI_XiQiIkQ',
    description: '엑세스 토큰',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    example: '2023-11-20T12:17:30.250',
    description: '만료 시간',
  })
  @IsString()
  expires_at: string;

  @ApiProperty({
    example: 'refresh_token',
    description: '리프레시 토큰',
  })
  @IsString()
  refresh_token: string;

  @ApiProperty({
    example: '2021-11-20T12:17:30.250',
    description: '리프레시 토큰 만료 시간',
  })
  @IsString()
  refresh_token_expires_at: string;

  @ApiProperty({
    example: 'id_token',
    description: '아이디 토큰',
  })
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
