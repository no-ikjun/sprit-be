import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/global/entities/user.entity';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userRepository.findOneByUserId(payload.user_id);
    if (user === null) {
      throw new HttpException('User Not Found', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
