export const EARTH_RADIUS_M = 6371000;

/** 위도 1도당 대략적인 미터 (위도에 거의 무관) */
export function approxMetersPerDegLat() {
  return 111320; // meters
}

/** 경도 1도당 미터(위도에 따라 변함) */
export function approxMetersPerDegLngAtLat(lat: number) {
  // 경도 1도 길이 ≈ 111320 * cos(lat)
  return 111320 * Math.cos((lat * Math.PI) / 180);
}

/** 줌 → 그리드 크기(m). 줌이 클수록(확대) 그리드 작아져서 더 자세히 풀림 */
export function zoomToGridMeters(zoom: number) {
  // 대략적 맵핑(필요시 조절):
  // z  8 → ~10km,  10 → ~5km,  12 → ~2km, 14 → ~600m, 16 → ~200m, 18 → ~70m, 20 → ~25m
  const table: Record<number, number> = {
    8: 10000,
    9: 7500,
    10: 5000,
    11: 3500,
    12: 2000,
    13: 1200,
    14: 600,
    15: 350,
    16: 200,
    17: 120,
    18: 70,
    19: 40,
    20: 25,
    21: 15,
    22: 10,
  };
  // 보간 없이 근접값 사용
  const clamped = Math.max(3, Math.min(22, Math.round(zoom)));
  return table[clamped] ?? 600; // 기본 600m
}

type Candidate = { entity: any; distance: number };

export function clusterByGrid(
  candidates: Candidate[],
  opts: { gridMeters: number; lat: number; lng: number },
) {
  const { gridMeters, lat } = opts;
  const mPerDegLat = approxMetersPerDegLat();
  const mPerDegLng = approxMetersPerDegLngAtLat(lat);

  const cellDegLat = gridMeters / mPerDegLat;
  const cellDegLng = gridMeters / mPerDegLng;

  // 같은 그리드 키에 들어오면 한 개만 대표로 유지
  type Bucket = {
    key: string;
    representative: Candidate; // 현재는 가장 먼저(=가까운 순으로 들어오게 정렬된 상태) 것을 대표로 채택
    count: number;
    members: Candidate[];
  };

  const map = new Map<string, Bucket>();

  for (const c of candidates) {
    const cellY = Math.floor(c.entity.lat / cellDegLat);
    const cellX = Math.floor(c.entity.lng / cellDegLng);
    const key = `${cellY}:${cellX}`;

    const bucket = map.get(key);
    if (!bucket) {
      map.set(key, {
        key,
        representative: c,
        count: 1,
        members: [c],
      });
    } else {
      bucket.count += 1;
      bucket.members.push(c);
      // 대표를 더 중심에 가까운 애로 바꾸고 싶다면 여기서 비교해서 교체 가능
      // if (c.distance < bucket.representative.distance) bucket.representative = c;
    }
  }

  return Array.from(map.values());
}
