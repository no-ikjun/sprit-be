import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/user/user.repository';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { JwtAccessStrategy } from './guard/jwtAccess.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/global/entities/user.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, UserRepository, UserService, JwtAccessStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
