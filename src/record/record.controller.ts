import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';
import { NewRecordDto } from './dto/record.dto';
import { Record } from 'src/global/entities/record.entity';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async setRecord(@Req() req, @Body() body: NewRecordDto): Promise<void> {
    const access_token = req.headers.authorization.split(' ')[1];
    await this.recordService.setRecord(body, access_token);
  }

  @Patch('end')
  @UseGuards(JwtAccessGuard)
  async endRecord(@Query() query): Promise<void> {
    await this.recordService.endRecord(query.record_uuid);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getRecordByUserUuid(@Req() req): Promise<Record[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getRecordByUserUuid(access_token);
  }

  @Get('notended')
  @UseGuards(JwtAccessGuard)
  async getNotEndedRecordByUserUuid(@Req() req): Promise<Record> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getNotEndedRecordByUserUuid(access_token);
  }
}
