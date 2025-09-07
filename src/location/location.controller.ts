import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { JwtAccessGuard } from 'src/auth/guard/jwtAccess.guard';

type MarkerDTO = {
  name: string;
  lat: number;
  lng: number;
  tags: string[];
  region: string;
  source: 'official-library' | 'naver-local';
};

@Controller('locations')
export class LocationController {
  constructor(private readonly service: LocationService) {}

  // // 공공데이터 기반 도서관 정보 조회
  // @Get('libraries')
  // async getLibraryMarkers(): Promise<MarkerDTO[]> {
  //   const spots = await this.service.fetchOfficialLibrarySeed();
  //   return spots.map((s) => ({
  //     name: s.name,
  //     lat: s.lat,
  //     lng: s.lng,
  //     tags: s.tags,
  //     region: s.region,
  //     source: s.source,
  //   }));
  // }

  // // 네이버 로컬 API 기반 도서관 정보 조회 (기본 시드)
  // @Get('spots')
  // async getNaverMarkers(): Promise<MarkerDTO[]> {
  //   const spots = await this.service.fetchNaverSeedDefault();
  //   return spots.map((s) => ({
  //     name: s.name,
  //     lat: s.lat,
  //     lng: s.lng,
  //     tags: s.tags,
  //     region: s.region,
  //     source: s.source,
  //   }));
  // }

  // 전체 도서관/공간 정보 조회 후 DB에 저장
  @Get('save')
  @UseGuards(JwtAccessGuard)
  async saveAllLocation(): Promise<{ totalParsed: number; affected: number }> {
    const librariesRes = await this.service.saveLibrariesFromCsv();
    const bookCafesRes = await this.service.saveFromBookCafeDefault();
    // const naverRes = await this.service.saveFromNaverDefault();
    return {
      totalParsed: librariesRes.totalParsed + bookCafesRes.totalParsed,
      affected: librariesRes.affected + bookCafesRes.affected,
    };
  }
}
