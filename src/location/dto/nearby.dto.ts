// src/location/dto/nearby.dto.ts
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetNearbyLocationsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  /** meters */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radius!: number;

  /** Web map zoom (3~22 권장). 클러스터 크기를 이 값으로 조절 */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(3)
  @Max(22)
  zoom?: number;

  /** 성능 보호용 상한 (클러스터 이전 단계에서 가져올 최대 후보 수) */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(5000)
  maxCandidates?: number;
}
