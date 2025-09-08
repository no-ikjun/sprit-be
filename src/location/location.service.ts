// src/location/location.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map, retry } from 'rxjs';

import * as fs from 'fs';
import * as path from 'path';
import * as iconv from 'iconv-lite';
import { parse as csvParse } from 'csv-parse/sync';
import { Location } from 'src/global/entities/location.entity';
import { generateRamdomId, getRandomString, getToday } from 'src/global/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { clusterByGrid, zoomToGridMeters } from './utils/geo';
import { GetNearbyLocationsDto } from './dto/nearby.dto';

export type LocalItem = {
  title: string; // HTML 포함
  link: string;
  category: string;
  description: string;
  telephone?: string;
  address: string; // 지번
  roadAddress: string; // 도로명
  mapx: string; // x
  mapy: string; // y
};

export type Spot = {
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  lat: number; // flutter_naver_map 용
  lng: number; // flutter_naver_map 용
  x: number; // 내부 기록용(옵션: lng * 1e7)
  y: number; // 내부 기록용(옵션: lat * 1e7)
  source: 'official-library' | 'naver-local' | 'book-cafe' | 'park';
  tags: string[];
  region: string; // 예: "서울특별시 강남구"
  keyword: string; // 예: "공공데이터"
};

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  private readonly NAVER_CLIENT_ID: string;
  private readonly NAVER_CLIENT_SECRET: string;
  private readonly NCP_API_KEY_ID?: string;
  private readonly NCP_API_KEY?: string;

  constructor(
    private readonly http: HttpService,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {
    this.NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
    this.NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
    this.NCP_API_KEY_ID = process.env.NCP_API_KEY_ID || '';
    this.NCP_API_KEY = process.env.NCP_API_KEY || '';

    if (!this.NAVER_CLIENT_ID || !this.NAVER_CLIENT_SECRET) {
      this.logger.warn(
        'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET가 설정되지 않았습니다. Local API 호출이 실패할 수 있습니다.',
      );
    }
  }

  // ========== 공통 유틸 ==========
  private toNum(n: unknown): number {
    if (typeof n === 'number') return Number.isFinite(n) ? n : 0;
    if (typeof n === 'string') {
      const v = Number(n.trim().replace(/[, ]/g, ''));
      return Number.isFinite(v) ? v : 0;
    }
    return 0;
  }
  private validLatLng(lat?: number, lng?: number) {
    return !!lat && !!lng && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  }
  private dedup(spots: Spot[]): Spot[] {
    const key = (s: Spot) =>
      `${(s.name || '').toLowerCase()}|${(
        s.roadAddress ||
        s.address ||
        ''
      ).toLowerCase()}`;
    const map = new Map<string, Spot>();
    for (const s of spots) {
      const k = key(s);
      if (!map.has(k)) map.set(k, s);
    }
    return Array.from(map.values());
  }

  // ========== CSV 공통 유틸 ==========
  private readAndDecodeCsv(csvPath: string): string {
    const raw = fs.readFileSync(csvPath);
    const tryDecode = (enc: 'utf8' | 'cp949') => iconv.decode(raw, enc);
    let text = tryDecode('utf8');
    if ((text.match(/\uFFFD/g) || []).length > 5) text = tryDecode('cp949');
    return text;
  }

  private detectDelimiter(text: string): string {
    const firstLine =
      text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
    const cands = [',', '\t', ';', '|', '^'];
    const counted = cands.map((d) => ({
      d,
      c: (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length,
    }));
    counted.sort((a, b) => b.c - a.c);
    return counted[0].c > 0 ? counted[0].d : ',';
  }

  private parseCsvRecords(
    text: string,
    delimiter: string,
  ): Record<string, any>[] {
    return csvParse(text, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      delimiter,
    });
  }

  private finalizeCsvSpots(spots: Spot[], totalRows: number): Spot[] {
    const cleaned = this.dedup(spots).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    this.logger.log(
      `CSV 변환(보정 없음) 완료: ${cleaned.length} spots (from ${totalRows} rows)`,
    );
    return cleaned;
  }

  // ============================================================
  // 공공데이터 - 도서관 정보 활용 데이터 수집
  // ============================================================
  async loadLibrariesFromCsv(csvPath: string): Promise<Spot[]> {
    const text = this.readAndDecodeCsv(csvPath);
    const delimiter = this.detectDelimiter(text);
    this.logger.log(`[CSV] delimiter detected = "${delimiter}"`);
    const records = this.parseCsvRecords(text, delimiter);
    if (!records.length) {
      this.logger.warn(`CSV에서 데이터가 없습니다: ${csvPath}`);
      return [];
    }

    const nameKey = 'LBRRY_NM'; // 도서관명
    const roadKey = 'LBRRY_ADDR'; // 주소
    const latKey = 'LBRRY_LA'; // 위도
    const lngKey = 'LBRRY_LO'; // 경도
    const sidoKey = 'ONE_AREA_NM'; // 시도
    const sigunguKey = 'TWO_AREA_NM'; // 시군구

    const out: Spot[] = [];
    for (const row of records) {
      const name = String(row[nameKey] ?? '').trim();
      const roadAddress = String(roadKey ? row[roadKey] : '').trim();
      const sido = String(sidoKey ? row[sidoKey] : '').trim();
      const sigungu = String(sigunguKey ? row[sigunguKey] : '').trim();
      const region = [sido, sigungu].filter(Boolean).join(' ').trim();

      const lat = this.toNum(latKey ? row[latKey] : undefined);
      const lng = this.toNum(lngKey ? row[lngKey] : undefined);

      // 지오코딩 없음: 좌표가 유효하지 않으면 스킵
      if (!this.validLatLng(lat, lng)) continue;

      out.push({
        name,
        category: '도서관',
        roadAddress,
        address: roadAddress,
        lat,
        lng,
        x: lng * 1e7,
        y: lat * 1e7,
        source: 'official-library',
        tags: ['도서관'],
        region,
        keyword: '공공데이터',
      });
    }

    return this.finalizeCsvSpots(out, records.length);
  }

  // ============================================================
  // 공공데이터 - 북카페 정보 활용 데이터 수집
  // ============================================================
  async loadBookcafesFromCsv(csvPath: string): Promise<Spot[]> {
    const text = this.readAndDecodeCsv(csvPath);
    const delimiter = this.detectDelimiter(text);
    this.logger.log(`[CSV] delimiter detected = "${delimiter}"`);
    const records = this.parseCsvRecords(text, delimiter);
    if (!records.length) {
      this.logger.warn(`CSV에서 데이터가 없습니다: ${csvPath}`);
      return [];
    }

    const nameKey = 'FCLTY_NM'; // 북카페 이름
    const roadKey = 'FCLTY_ROAD_NM_ADDR'; // 주소
    const latKey = 'FCLTY_LA'; // 위도
    const lngKey = 'FCLTY_LO'; // 경도
    const typeKey = 'MLSFC_NM'; // 유형

    const out: Spot[] = [];
    for (const row of records) {
      const name = String(row[nameKey] ?? '').trim();
      const roadAddress = String(roadKey ? row[roadKey] : '').trim();
      const type = String(typeKey ? row[typeKey] : '').trim();
      const lat = this.toNum(latKey ? row[latKey] : undefined);
      const lng = this.toNum(lngKey ? row[lngKey] : undefined);
      const region = roadAddress.split(' ').slice(0, 2).join(' ');
      //  좌표가 유효하지 않으면 스킵
      if (!this.validLatLng(lat, lng)) continue;

      out.push({
        name,
        category: '북카페',
        roadAddress,
        address: roadAddress,
        lat,
        lng,
        x: lng * 1e7,
        y: lat * 1e7,
        source: 'book-cafe',
        tags: ['북카페', type],
        region,
        keyword: '공공데이터',
      });
    }

    return this.finalizeCsvSpots(out, records.length);
  }

  // ============================================================
  // 공공데이터 - 북카페 정보 활용 데이터 수집
  // ============================================================
  async loadParksFromCsv(csvPath: string): Promise<Spot[]> {
    const text = this.readAndDecodeCsv(csvPath);
    const delimiter = this.detectDelimiter(text);
    this.logger.log(`[CSV] delimiter detected = "${delimiter}"`);
    const records = this.parseCsvRecords(text, delimiter);
    if (!records.length) {
      this.logger.warn(`CSV에서 데이터가 없습니다: ${csvPath}`);
      return [];
    }

    const nameKey = 'POI_NM'; // 공원 이름
    const siDo = 'CTPRVN_NM'; // 주소-시도
    const siGunGu = 'SIGNGU_NM'; // 주소-시군구
    const roadName = 'RDNMADR_NM'; // 주소-도로명
    const roadNumber = 'BULD_NO'; // 주소-건물번호
    const latKey = 'LC_LA'; // 위도
    const lngKey = 'LC_LO'; // 경도
    const typeKey = 'MLSFC_NM'; // 유형

    const out: Spot[] = [];
    for (const row of records) {
      const name = String(row[nameKey] ?? '').trim();
      // 필수 주소 요소 체크 (시도, 시군구, 도로명 중 하나라도 없으면 스킵)
      if (!row[siDo] || !row[siGunGu] || !row[roadName]) {
        continue;
      }
      const roadAddress = [
        row[siDo],
        row[siGunGu],
        row[roadName],
        row[roadNumber],
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      const type = String(typeKey ? row[typeKey] : '').trim();
      const lat = this.toNum(latKey ? row[latKey] : undefined);
      const lng = this.toNum(lngKey ? row[lngKey] : undefined);
      const region = roadAddress.split(' ').slice(0, 2).join(' ');
      //  좌표가 유효하지 않으면 스킵
      if (!this.validLatLng(lat, lng)) continue;

      out.push({
        name,
        category: '공원',
        roadAddress,
        address: roadAddress,
        lat,
        lng,
        x: lng * 1e7,
        y: lat * 1e7,
        source: 'park',
        tags: [type],
        region,
        keyword: '공공데이터',
      });
    }

    return this.finalizeCsvSpots(out, records.length);
  }

  // ============================================================
  // 네이버 Local API 활용 데이터 수집
  // ============================================================
  private async geocodeWithNaverMaps(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    // Local API 경로에서만 사용 (CSV 경로에서는 호출하지 않음)
    if (!this.NCP_API_KEY_ID || !this.NCP_API_KEY) return null;
    try {
      const url =
        'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode';
      const config: AxiosRequestConfig = {
        params: { query: address },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.NCP_API_KEY_ID,
          'X-NCP-APIGW-API-KEY': this.NCP_API_KEY,
        },
        timeout: 10000,
      };
      const res$ = this.http.get(url, config).pipe(
        retry({ count: 2, delay: 300 }),
        map((r) => r.data),
      );
      const data = await lastValueFrom<any>(res$);
      const item = data?.addresses?.[0];
      if (!item) return null;
      const lng = this.toNum(item.x);
      const lat = this.toNum(item.y);
      if (!this.validLatLng(lat, lng)) return null;
      return { lat, lng };
    } catch (e) {
      this.logger.warn(
        `Geocoding 실패: ${address} :: ${(e as Error)?.message}`,
      );
      return null;
    }
  }

  private async searchLocal(
    query: string,
    display = 50,
    start = 1,
    sort: 'random' | 'comment' = 'comment',
  ) {
    const url = 'https://openapi.naver.com/v1/search/local.json';
    const config: AxiosRequestConfig = {
      params: { query, display, start, sort },
      headers: {
        'X-Naver-Client-Id': this.NAVER_CLIENT_ID || '',
        'X-Naver-Client-Secret': this.NAVER_CLIENT_SECRET || '',
      },
      timeout: 10000,
    };
    const res$ = this.http.get(url, config).pipe(
      retry({ count: 2, delay: 300 }),
      map((r) => r.data?.items ?? []),
    );
    return lastValueFrom<any[]>(res$);
  }

  private htmlStrip(s: string): string {
    return (s || '').replace(/<[^>]+>/g, '').trim();
  }
  private buildTags(category: string, keyword: string): string[] {
    const tags = new Set<string>();
    if ((category ?? '').includes('카페')) tags.add('카페');
    if ((category ?? '').includes('서점')) tags.add('서점');
    if ((keyword ?? '').includes('공원')) tags.add('공원');
    if ((keyword ?? '').includes('스터디')) tags.add('스터디');
    if ((keyword ?? '').includes('조용')) tags.add('조용함');
    if ((keyword ?? '').includes('북카페')) tags.add('북카페');
    return Array.from(tags);
  }
  private toDecimalFromWGS84Int(n: number | string | undefined): number {
    const v = typeof n === 'string' ? Number(n) : n ?? 0;
    return Number.isFinite(v) ? (v as number) / 1e7 : 0; // Local API mapx/mapy 스케일
  }

  /**
   * 지역×키워드 수집 (네이버 Local API)
   * - 필요 시 주소 기반 지오코딩(보정) 수행
   */
  async fetchSeedSpotsFromNaver(
    regions: string[],
    keywords: string[],
    pagesPerQuery = 2,
    display = 50,
    enableGeocode = true, // ← 네이버 경로만 보정 허용
  ): Promise<Spot[]> {
    const acc: Spot[] = [];

    for (const region of regions) {
      for (const keyword of keywords) {
        for (let p = 0; p < pagesPerQuery; p++) {
          const start = 1 + p * display;

          let items: any[] = [];
          try {
            items = await this.searchLocal(
              `${region} ${keyword}`,
              display,
              start,
              'comment',
            );
          } catch (e) {
            this.logger.warn(
              `Local API 실패: r=${region}, k=${keyword}, start=${start} :: ${
                (e as Error)?.message
              }`,
            );
          }
          if (!items.length) break;

          for (const it of items) {
            // mapx/mapy → decimal
            const lng0 = this.toDecimalFromWGS84Int(it.mapx);
            const lat0 = this.toDecimalFromWGS84Int(it.mapy);

            let lat = lat0;
            let lng = lng0;

            // 네이버 경로에서만 보정 허용
            if (!this.validLatLng(lat, lng) && enableGeocode) {
              const targetAddr = String(it.roadAddress || it.address || '');
              if (targetAddr) {
                const geo = await this.geocodeWithNaverMaps(targetAddr);
                if (geo !== null) {
                  // 명시적 null 체크
                  lat = geo.lat;
                  lng = geo.lng;
                }
              }
            }

            if (!this.validLatLng(lat, lng)) continue;

            acc.push({
              name: this.htmlStrip(it.title),
              category: it.category ?? '',
              address: it.address ?? '',
              roadAddress: it.roadAddress ?? '',
              lat,
              lng,
              x: lng * 1e7,
              y: lat * 1e7,
              source: 'naver-local',
              tags: this.buildTags(it.category ?? '', keyword),
              region,
              keyword,
            });
          }
        }
      }
    }

    const cleaned = this.dedup(acc).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    this.logger.log(`Naver 수집 완료: ${cleaned.length} spots`);
    return cleaned;
  }

  // ============================================================
  // 공개 메서드(컨트롤러에서 호출)
  // ============================================================
  /** 공공데이터 CSV → Spot[] (보정 없음) */
  async fetchOfficialLibrarySeed(
    csvPath = path.resolve(__dirname, 'data', 'NL_CD_LIBRARY_202412.csv'),
  ): Promise<Spot[]> {
    return this.loadLibrariesFromCsv(csvPath);
  }

  /** 네이버 Local API → Spot[] (보정 허용 기본값 true) */
  async fetchNaverSeedDefault(): Promise<Spot[]> {
    const regions = [
      '서울',
      '성수',
      '홍대',
      '강남',
      '혜화',
      '분당',
      '일산',
      '부천',
      '인천',
      '광주',
      '전남대',
      '조선대',
      '순천',
      '담양',
      '목포',
      '여수',
    ];
    const keywords = [
      '북카페',
      '스터디카페',
      '조용한 카페',
      '독립서점',
      '동네책방',
      '독서하기 좋은 공원',
    ];
    return this.fetchSeedSpotsFromNaver(regions, keywords, 2, 50, true);
  }

  private spotToEntity(s: Spot): Location {
    const entity = new Location();
    entity.location_uuid = generateRamdomId(
      'SP' + getRandomString(6),
      getToday(),
      getRandomString(8),
    );
    entity.name = s.name;
    entity.category = s.category ?? '도서관';
    entity.address = s.address ?? '';
    entity.roadAddress = s.roadAddress ?? '';
    entity.lat = s.lat;
    entity.lng = s.lng;
    entity.x = s.x ?? 0;
    entity.y = s.y ?? 0;
    entity.source = s.source;
    entity.tags = s.tags ?? [];
    entity.region = s.region ?? '';
    entity.keyword = s.keyword ?? '';
    // entity.externalId = ???  // 필요 시 매핑
    return entity;
  }

  async saveSpots(spots: Spot[]): Promise<number> {
    if (!spots.length) return 0;

    const rows = spots.map((s) => this.spotToEntity(s));

    await this.locationRepo.upsert(rows, {
      conflictPaths: ['name', 'roadAddress'],
      skipUpdateIfNoValuesChanged: true,
    });
    return rows.length;
  }

  // === 공개 API: 수집→저장 원샷 ===

  /** CSV(공공데이터) → Spot → DB 저장 */
  async saveLibrariesFromCsv(
    csvPath = path.resolve(__dirname, 'data', 'NL_CD_LIBRARY_202412.csv'),
  ) {
    const spots = await this.loadLibrariesFromCsv(csvPath);
    const affected = await this.saveSpots(spots);
    return { totalParsed: spots.length, affected };
  }

  /** 북카페 수집(기존 fetchNaverSeedDefault 사용) → DB 저장 */
  async saveFromBookCafeDefault(
    csvPath = path.resolve(
      __dirname,
      'data',
      'KC_CAFE_BOOK_STOR_LIST_2023.csv',
    ),
  ) {
    const spots = await this.loadBookcafesFromCsv(csvPath);
    const affected = await this.saveSpots(spots);
    return { totalParsed: spots.length, affected };
  }

  /** 공원 수집(기존 fetchNaverSeedDefault 사용) → DB 저장 */
  async saveFromParkDefault(
    csvPath = path.resolve(
      __dirname,
      'data',
      'KC_498_DMSTC_MCST_PBL_CT_PARK_2024.csv',
    ),
  ) {
    const spots = await this.loadParksFromCsv(csvPath);
    const affected = await this.saveSpots(spots);
    return { totalParsed: spots.length, affected };
  }

  /** 네이버 수집(기존 fetchNaverSeedDefault 사용) → DB 저장 */
  async saveFromNaverDefault() {
    const spots = await this.fetchNaverSeedDefault();
    const affected = await this.saveSpots(spots);
    return { totalParsed: spots.length, affected };
  }

  async findNearbyWithClustering(dto: GetNearbyLocationsDto) {
    const { lat, lng, radius, zoom = 14, maxCandidates = 1500 } = dto;

    // 거리 식 (클램프 포함)
    const inner = `
    LEAST(1, GREATEST(-1,
      cos(radians(:lat)) * cos(radians(l.lat)) * cos(radians(l.lng) - radians(:lng))
      + sin(radians(:lat)) * sin(radians(l.lat))
    ))
  `;
    const distanceExpr = `(6371000 * acos(${inner}))`;

    const qb = this.locationRepo
      .createQueryBuilder('l')
      .addSelect('l.lat', 'lat')
      .addSelect('l.lng', 'lng')
      .addSelect('l.name', 'name')
      .addSelect('COALESCE(l.roadAddress, l.address)', 'address')
      .addSelect(distanceExpr, 'distance')
      .where(`${distanceExpr} <= :radius`)
      .orderBy('distance', 'ASC')
      .limit(maxCandidates)
      .setParameters({ lat, lng, radius });

    const rows = await qb.getRawMany<{
      lat: string | number;
      lng: string | number;
      name: string;
      address: string | null;
      distance: string | number;
    }>();

    const candidates = rows.map((r) => ({
      entity: {
        lat: Number(r.lat),
        lng: Number(r.lng),
        name: r.name,
        address: r.address ?? '',
      },
      distance: Number(r.distance),
    }));

    const gridMeters = zoomToGridMeters(zoom);
    const clustered = clusterByGrid(candidates, { gridMeters, lat, lng });

    return clustered.map((c) => ({
      lat: c.representative.entity.lat,
      lng: c.representative.entity.lng,
      name: c.representative.entity.name,
      address: c.representative.entity.address,
    }));
  }
}
