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
import { AddRecordDto, NewRecordDto } from './dto/record.dto';
import { Record } from 'src/global/entities/record.entity';
import {
  BookRecordHistoryType,
  BookRecordHistoryTypeV2,
  MonthlyRecordResponseType,
} from 'src/global/types/response.type';

@Controller('v1/record')
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
    await this.recordService.endRecord(
      query.record_uuid,
      query.page_end,
      query.total_time,
    );
  }

  @Delete()
  @UseGuards(JwtAccessGuard)
  async deleteRecord(@Query() query): Promise<void> {
    await this.recordService.deleteRecord(query.record_uuid);
  }

  @Get()
  @UseGuards(JwtAccessGuard)
  async getRecordByRecordUuid(@Query() query): Promise<Record> {
    return await this.recordService.getRecordByRecordUuid(query.record_uuid);
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

  @Patch('goal-achieved')
  @UseGuards(JwtAccessGuard)
  async setGoalAchieved(@Query() query): Promise<void> {
    await this.recordService.updateGoalAchieved(
      query.record_uuid,
      JSON.parse(query.goal_achieved),
    );
  }

  @Get('last-page')
  @UseGuards(JwtAccessGuard)
  async getLastPage(@Req() req, @Query() query): Promise<number> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getLastPage(
      query.book_uuid,
      access_token,
      JSON.parse(query.is_before_record),
    );
  }

  @Patch('page-end')
  @UseGuards(JwtAccessGuard)
  async updatePage(@Query() query): Promise<void> {
    await this.recordService.updatePage(query.record_uuid, query.page_end);
  }

  @Get('record-count')
  @UseGuards(JwtAccessGuard)
  async getRecordCount(@Req() req, @Query() query): Promise<number[]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getRecordCountByUserUuid(
      access_token,
      JSON.parse(query.count),
    );
  }

  @Get('daily-record')
  @UseGuards(JwtAccessGuard)
  async getDailyRecord(@Req() req, @Query() query): Promise<number> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getDailyRecordTotalTime(
      access_token,
      JSON.parse(query.year),
      JSON.parse(query.month),
      JSON.parse(query.date),
    );
  }

  @Get('weekly-record')
  @UseGuards(JwtAccessGuard)
  async getWeeklyRecord(
    @Req() req,
    @Query() query,
  ): Promise<BookRecordHistoryType[][]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getWeeklyRecordHistory(
      access_token,
      JSON.parse(query.back_week) ?? 0,
      JSON.parse(query.count) ?? 7,
      JSON.parse(query.today),
    );
  }

  @Get('weekly-record-v2')
  @UseGuards(JwtAccessGuard)
  async getWeeklyRecordV2(
    @Req() req,
    @Query() query,
  ): Promise<BookRecordHistoryTypeV2[][]> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getWeeklyRecordHistoryV2(
      access_token,
      JSON.parse(query.back_week) ?? 0,
      JSON.parse(query.count) ?? 7,
      JSON.parse(query.today),
    );
  }

  @Get('monthly-count')
  @UseGuards(JwtAccessGuard)
  async getMonthlyRecordCount(
    @Req() req,
    @Query() query,
  ): Promise<MonthlyRecordResponseType> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.getMonthlyRecordCount(
      access_token,
      JSON.parse(query.year),
      JSON.parse(query.month),
      query.kind,
    );
  }

  @Post('add')
  @UseGuards(JwtAccessGuard)
  async addRecord(@Req() req, @Body() body: AddRecordDto): Promise<string> {
    const access_token = req.headers.authorization.split(' ')[1];
    return await this.recordService.addRecordAfterRead(body, access_token);
  }
}
