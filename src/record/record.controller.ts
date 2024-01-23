import {
  Body,
  Controller,
  Delete,
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
  async setRecord(@Req() req, @Body() body: NewRecordDto): Promise<string> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.setRecord(body, access_token);
  }

  @Patch('stop')
  @UseGuards(JwtAccessGuard)
  async endRecord(@Query() query): Promise<void> {
    await this.recordService.endRecord(query.record_uuid, query.page_end);
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteRecord(@Query() query): Promise<void> {
    await this.recordService.deleteRecord(query.record_uuid);
  }

  @Get('all')
  @UseGuards(JwtAccessGuard)
  async getRecordByUserUuid(@Req() req): Promise<Record[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getRecordByUserUuid(access_token);
  }

  @Get('ended')
  @UseGuards(JwtAccessGuard)
  async getEndedRecordByUserUuid(@Req() req): Promise<Record[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getEndedRecordByUserUuid(access_token);
  }

  @Get('notended')
  @UseGuards(JwtAccessGuard)
  async getNotEndedRecordByUserUuid(@Req() req): Promise<Record> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getNotEndedRecordByUserUuid(access_token);
  }
}
