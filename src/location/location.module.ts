import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from 'src/global/entities/location.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Location])],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
