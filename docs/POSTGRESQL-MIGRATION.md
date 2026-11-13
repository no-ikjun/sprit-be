# sprit PostgreSQL 이전 리허설 — 2026-11-13

> 아래는 1차 리허설 기록이다. 후속 사용자 지시로 운영 전환까지 승인되었다. 최종 결과와 변경된 호환 처리·환경 계약은 POSTGRESQL-CUTOVER.md를 우선한다.

이번 변경은 로컬 호환성 수정과 데이터 보존 리허설이다. **운영 접속 전환, 컨테이너 중단, DB 생성/삭제, Kubernetes 설치는 수행하지 않았다.** `DATABASE_TYPE` 기본값은 `mysql`이며 `synchronize: false`를 유지한다.

## 확인한 기준

- 로컬 기준 커밋: `7393906f7de68540c9b8e563676d6cd0039c64a5` (시작 시 clean).
- 운영 이미지: `sha256:2c43b34c3dd04151676c5baf8774677889d1af2c5d6060714084ed3379285f8a`, 컨테이너 생성 2025-10-29. Node 18.20.8, TypeORM 0.3.17. 이미지에 Git SHA 메타데이터가 없어 커밋 동일성은 주장하지 않는다.
- 운영 TS 소스 해시와 로컬 비교: `health.module.ts`, `record.repository.ts`만 다름. 후자는 디버그 로그 제거 차이. 나머지 운영 TS 파일은 일치.
- 원본 MariaDB 10.6.23, DB `sprit`, 22개 InnoDB 테이블. view/trigger/routine/event 없음. 실제 스키마와 엔티티의 nullable/default/unique/type 선언이 다르므로 **엔티티 synchronize로 스키마를 생성하지 않는다.**
- 목적 공유 PostgreSQL: `gistag-postgres-1`, PostgreSQL 16.13 Alpine. `und-x-icu` 정렬 지원을 읽기 전용 확인했다. `arrive`가 사용 중이므로 컨테이너·볼륨을 유지한다.
- 최종 앱 검증은 운영과 같은 Node 18.20.8에서 13개 묶음 통과. Node 22에서도 이전 단계 검증을 실행했다. 빌드 성공, 변경 TS 파일 ESLint 0 errors (기존 unused response 경고 1개).
- 이전 안전 검사 6개 통과: 대상 이름 불일치/기본 원격/비어 있지 않은 대상 거부, FK 실패 시 모든 DDL·데이터 rollback, 빈 대상 재시도, 거부 후 원본 해시 보존. `test-migration-guards.cjs`와 `guard-report.json` 참조.
- 로컬 검증: PostgreSQL 16.11 Homebrew, 전용 Unix socket/포트 55439, TCP listen 없음. 운영과 OS/ICU 버전이 다르므로 최종 대상 환경에서 다시 검증해야 한다.

## 보존 자료와 검증 결과

개인정보/비밀번호 해시/토큰이 들어 있는 자료는 Git 밖의 접근 제한 폴더에만 있다:

`/Users/ikjunchoi/Documents/Coding/SPRIT/.sprit-migration-private`

- 폴더 0700, 원본 `source-snapshot.json`과 `original-sprit.sql.gz`는 0400. 별도 암호화 파일은 아니며 로컬 파일 권한으로 보호한다. 별도 승인된 백업 저장소로 복사 후 보존 정책에 따라 정리한다.
- JSON 스냅샷 시각: **2026-11-13 22:25:16 KST**. SHA-256: `2de229af5200c9d0dd93b2e1b9d8c435ae2669144c70b38b2e88f67d51ae202b`.
- 원본 SQL gzip SHA-256: `be82e51855773f9592ed9e42642a0869918c443f7d2e3657f021ea0565826dff`. SQL 백업은 나중의 별도 일관된 스냅샷이며 최종 전환용 최신 백업이 아니다.
- PostgreSQL 적재: **22개 테이블, 14,401행**, 모든 컬럼의 정규화된 값 및 NULL 포함 테이블별 SHA-256 일치. 문자열/비밀번호 해시/토큰/키는 변경하지 않았다.
- 기본키 22개, 검증 완료 외래키 19개, 인덱스 41개. AUTO_INCREMENT 및 sequence는 원본·대상 모두 **0개**이므로 setval 대상 없음. 새 스키마에 identity가 생기면 도구가 거부하며 수동 검토가 필요하다.
- 원본 SQL 덤프는 `--network none` 임시 MariaDB 10.6에 복원했다. 22개 테이블/14,401행 일치. 문자열/정수/NULL 등은 일치. location double 값 1,557개의 비교에서 최대 상대오차 `1.9008008596538898e-16`이 관찰되었다(SQL 덤프/클라이언트 10진 표현의 최하위 자리). 이 검증을 비트 단위 동일성으로 보고하지 않는다. JSON→PostgreSQL 경로는 정규화 값 해시가 정확히 일치했다.
- `load-report.json`, `verify-report.json`, `smoke-report.json`, `mariadb-restore-report.json`, `guard-report.json`에 개인정보 없는 집계 결과를 저장했다. 검증된 PostgreSQL의 custom-format 백업은 `sprit-postgres-verified.dump`에 보관한다. 검증 종료 후 로컬 PostgreSQL은 중지하고 임시 MariaDB 컨테이너와 해당 임시 볼륨을 제거했다. 실패 로그는 외부에 붙이지 말고 보호된 폴더에서 확인한다.

| 테이블 | 정확한 행 수 | 테이블 | 정확한 행 수 |
|---|---:|---|---:|
| article | 271 | article_like | 15 |
| banner | 2 | book | 1,432 |
| book_library | 747 | book_report | 45 |
| fcm_token | 441 | location | 7,525 |
| notice | 4 | phrase | 284 |
| profile | 89 | profile_recommend_book | 0 |
| quest | 2 | quest_agree | 441 |
| quest_apply | 40 | record | 1,502 |
| remind_agree | 441 | review | 143 |
| time_agree | 441 | user | 430 |
| user_follow | 104 | version | 2 |

## 코드와 데이터 매핑

- `pg` 8.16.3 추가. `DATABASE_TYPE=postgres`로 명시적으로 선택한다. MySQL 드라이버는 기존 운영과 복구 준비를 위해 유지한다.
- 기존 DATETIME을 `timestamp(0) without time zone`으로 보존한다. 앱 프로세스 `TZ=Asia/Seoul` 필수, DB 세션 timezone도 Asia/Seoul이다. 기존 MySQL 드라이버의 `+09:00` 해석을 보존하며 과거 데이터를 임의로 9시간 이동하지 않는다. PostgreSQL은 새 소수초 값을 지정 precision으로 반올림할 수 있다.
- UUID 이름의 기존 문자열 키를 `varchar(255)`로 보존한다. location의 `SP...` 키는 UUID 타입이 아니다. TypeORM 생성 UUID 4개 컬럼만 신규 INSERT default를 `gen_random_uuid()::text`로 지정했다. 원본 키는 그대로 복사한다. extension 자동 설치는 끈다(PostgreSQL 16 기본 함수 사용).
- tinyint(1)은 0/1/NULL 확인 후 boolean으로 옮긴다. 미지원 타입/기본값/인덱스/자동 생성 컬럼은 추측하지 않고 실패한다.
- 실제 DB의 PK/FK/인덱스/길이/nullability/default를 기준으로 생성한다. 엔티티에만 있는 unique 제약을 임의로 추가하지 않는다.
- `RAND()` 분기, 프로필 raw-column 별칭, 빈 추천 목록, 추천 도서 relation 로딩을 수정했다. location의 혼합 대소문자 컬럼은 식별자 인용으로 유지한다.
- location의 실제 스키마에는 `(name, roadAddress)` unique가 없다. MySQL에서 생성된 새 키가 INSERT되던 동작을 명시적 INSERT로 유지한다. deduplication이나 기존 행 삭제를 추가하지 않는다.
- 월간 통계는 기존 **0-based month** API 계약을 유지하면서 KST 월 경계를 사용한다. 일간 API는 기존 1-based month 계약이다. 이전 코드의 UTC 월 경계로 한국 시간 월초 9시간이 제외되던 문제를 수정했다.
- `REHEARSAL_MODE=true`는 `.env` 로딩, 자동 스케줄 등록, Firebase 초기화/발송을 끈다. smoke 도구는 추가로 Unix DB 소켓과 loopback 외 네트워크를 차단한다. 프로덕션에서 이 플래그를 활성화하면 예약/푸시가 중단되므로 전환 시 제거한다.

### 정렬/계정 데이터의 남은 확인 사항

MariaDB `utf8mb3_general_ci`와 PostgreSQL ICU는 완전히 같은 정렬이 아니다. `sprit_ci` ICU primary-strength 정렬로 대소문자/악센트 무시 equality를 제공한다. PostgreSQL 16에서 nondeterministic collation은 패턴 검색을 지원하지 않아 프로필 검색에 deterministic ICU + ILIKE를 사용한다. 따라서 **악센트 검색(é와 e), ß/ss, Unicode 정렬 순서** 등은 달라질 수 있다. 한국어/ASCII 검색 및 로그인은 검증했지만 모든 문자 조합의 동등성은 보장하지 않는다. 운영 전환 전에 이 차이를 수용할지, 별도 검색 정규화를 추가할지 확정한다.

실제 `user_id`에 후행 공백 1개가 있어 PostgreSQL 로그인 조회는 양쪽 `rtrim`으로 MariaDB PAD SPACE 비교를 보존한다. **완전히 동일한 user_id를 가진 기존 계정 2개(1그룹)**도 있다. 데이터를 합치거나 삭제하거나 unique를 추가하지 않았다. `LIMIT 1`의 선택 계정이 DB에 따라 달라질 수 있으므로 해당 계정은 보호된 관리자 환경에서 확인하고 정책을 정한 뒤 전환한다. 이 문서와 로그에 계정 식별자는 싣지 않는다.

공식 근거: [PostgreSQL 16 collation](https://www.postgresql.org/docs/16/collation.html), [node-postgres date/time parsing](https://node-postgres.com/features/types).

## 도구 실행과 재현

저장소 루트에서 실행한다. 아래 로컬 환경은 기존 개발 DB를 사용하지 않는다. 값이 있는 DB에 load를 재실행하면 실패하는 것이 정상이다. 다시 검증은 `verify`, 재적재는 **새 빈 DB 이름**을 사용한다.

```sh
export PRIVATE=/Users/ikjunchoi/Documents/Coding/SPRIT/.sprit-migration-private
export PGHOST="$PRIVATE" PGPORT=55439
# 중지해 둔 클러스터를 다시 시작할 때만 실행
pg_ctl -D "$PRIVATE/pgdata" -l "$PRIVATE/postgres.log" \
  -o "-p 55439 -k $PRIVATE -c listen_addresses= -c shared_buffers=32MB" start

export PGDATABASE=sprit_rehearsal_20261113
export MIGRATION_TARGET_DATABASE="$PGDATABASE"
node scripts/migration/migrate-postgres.cjs verify "$PRIVATE/source-snapshot.json"
# 새로운 이름으로만 load 리허설
createdb sprit_rehearsal_fresh
PGDATABASE=sprit_rehearsal_fresh MIGRATION_TARGET_DATABASE=sprit_rehearsal_fresh \
  node scripts/migration/migrate-postgres.cjs load "$PRIVATE/source-snapshot.json"
```

원본 추출은 운영 sprit 컨테이너의 환경변수를 내부에서 사용한다. credentials를 출력하거나 shell 인수로 복사하지 않는다. `export-mariadb.cjs`는 source가 `sprit`인지 확인하고 REPEATABLE READ / READ ONLY 일관된 스냅샷에서 읽는다. 모든 테이블이 InnoDB인지 확인한다. 스키마 동시 변경은 별도 금지해야 한다. 출력에는 개인정보가 있으므로 반드시 보호된 새 파일에 저장한다.

```sh
umask 077
set -o noclobber
ssh -i /Users/ikjunchoi/.ssh/gistag_be_deploy -o IdentitiesOnly=yes \
  -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 \
  ubuntu@13.209.95.133 'docker exec -i sprit node' \
  < scripts/migration/export-mariadb.cjs > "$PRIVATE/source-snapshot-NEW.json"
# 성공 종료와 JSON 파싱을 확인한 뒤 checksum과 파일 권한을 기록한다.
```

API 테스트는 검증된 DB를 복제한 **일회용 DB**에서 실행한다. 테스트는 일부 데이터를 추가/수정하므로 복제본을 보존 검증 결과로 사용하지 않는다. app 계정은 SELECT/INSERT/UPDATE/DELETE만 가진다.

```sh
createdb -T sprit_rehearsal_20261113 sprit_rehearsal_api_fresh
psql -X -v ON_ERROR_STOP=1 -d sprit_rehearsal_api_fresh <<'SQL'
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO sprit_rehearsal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sprit_rehearsal_app;
SQL
TZ=Asia/Seoul REHEARSAL_MODE=true DATABASE_TYPE=postgres \
DATABASE_HOST="$PRIVATE" DATABASE_PORT=55439 \
DATABASE_NAME=sprit_rehearsal_api_fresh DATABASE_USER=sprit_rehearsal_app \
JWT_ACCESS_TOKEN_SECRET=local-rehearsal-only JWT_ACCESS_TOKEN_EXPIRATION_TIME=3600 \
AWS_REGION=ap-northeast-2 \
node -r ts-node/register/transpile-only -r tsconfig-paths/register \
  scripts/migration/smoke-postgres.cjs "$PRIVATE/source-snapshot.json"
```

smoke 검증: 전체 엔티티/행/시간/boolean, CREATE/TRUNCATE 권한 거부, 자동 cron/Firebase 차단, 기존 프로필 검색·추천, 빈 추천, 위치 거리·컬럼명, 리뷰 숫자 집계, 건강 상태·인증 가드·비밀번호 로그인·공백 비교, 기록 CRUD, KST 자정/월간/일간/주간 통계, 새 UUID·추천 도서 relation·프로필 수정·팔로우, 위치 삽입, 알림 대상 선택·예약 함수 stub 호출. 외부 OAuth(Kakao/Apple), S3 업로드, 실제 푸시 발송, 외부 도서 수집은 실행하지 않는다.

## 운영 준비 — 아직 실행하지 않음

**주의: 현재 CI는 production 대상 pull_request에서도 배포 job을 실행한다.** 이 변경을 production에 push하거나 PR을 생성하기 전에 자동 배포 경로를 분리/차단해야 한다. 이번 작업은 commit/push/PR/deploy를 하지 않는다. healthcheck는 이미지에 없는 curl을 호출하므로 `/health` 200과 Docker unhealthy를 구분한다. 전환 이미지 검증 전에 Node HTTP 기반 healthcheck 등으로 별도 수정한다.

1. 위 계정 중복/문자 비교 차이를 해결 또는 명시적으로 수용한다. 동일 이미지와 PostgreSQL 16 Alpine/ICU 환경에서 재검증하고 배포 이미지를 immutable digest로 고정한다. 최신 원본 행 수/해시와 최종 대상 값 검증을 다시 수행한다.
2. 공유 PostgreSQL 전체와 `arrive`를 백업하고 메모리/디스크 여유를 확인한다. sprit만 이전해도 MariaDB의 `agora`, `analyst`가 남으므로 MariaDB를 중단하지 않는다. `gistag-postgres-1`/`gistag_postgres_data`는 arrive용으로 유지한다. 구형 DB·gistag 정리와 k3s는 별도 작업이다.
3. 관리자 계정으로 **새 빈 `sprit` DB**, 전용 `sprit_migrator`와 `sprit_app`을 생성한다. 이름이 이미 있으면 중단하고 사용 여부를 확인한다. 아래는 검토용 SQL이며 비밀번호는 `\password` 또는 비밀 관리 도구로 별도 설정한다. 비밀을 SQL 파일/Git/CLI 인수에 쓰지 않는다.

```sql
CREATE ROLE sprit_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE sprit_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE DATABASE sprit OWNER sprit_migrator TEMPLATE template0 ENCODING 'UTF8';
REVOKE ALL ON DATABASE sprit FROM PUBLIC;
GRANT CONNECT ON DATABASE sprit TO sprit_app;
-- sprit DB로 연결한 뒤:
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO sprit_app;
-- migrator로 load가 성공하고 verify까지 마친 뒤:
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sprit_app;
ALTER DEFAULT PRIVILEGES FOR ROLE sprit_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sprit_app;
ALTER ROLE sprit_app IN DATABASE sprit SET timezone TO 'Asia/Seoul';
-- 관리자 계정에서 마지막에 migrator의 신규 로그인 금지:
ALTER ROLE sprit_migrator NOLOGIN;
```

앱에는 DDL/TRUNCATE/다른 role membership을 주지 않는다. 현재 sequence는 없으므로 sequence 권한도 불필요하다. 기존 arrive/gistag의 PUBLIC CONNECT 권한 때문에 개별 role에서 REVOKE만 해서는 다른 DB 접속을 막을 수 없다. **pg_hba에서 sprit_app의 접속을 sprit DB와 지정 앱 네트워크에만 허용하고 나머지를 거부**하는 규칙을 기존 광범위 허용 규칙보다 앞에 둔다. Unix/IPv4/IPv6 경로를 함께 점검한다. 공유 DB의 기존 사용자 규칙을 보존하며 reload 후 arrive 건강 상태를 확인한다. 이는 별도 운영 승인 후 실행할 작업이다.

4. 앱을 `gistag-net`에 연결할 계획과 DNS `gistag-postgres-1:5432` 도달성을 검증한다. host 5432를 새로 공개하지 않는다. `DATABASE_TYPE=postgres`, `DATABASE_HOST`, `DATABASE_PORT=5432`, `DATABASE_NAME=sprit`, `DATABASE_USER=sprit_app`, 별도 비밀, `TZ=Asia/Seoul`을 준비한다. rehearsal 플래그는 실제 전환 전 제거한다.
5. 운영 load는 `PGDATABASE=sprit MIGRATION_TARGET_DATABASE=sprit`, 비밀 파일/PGPASSFILE로 연결한다. 직접 원격 대상이면 추가로 `MIGRATION_ALLOW_REMOTE=true`를 명시해야 한다. DB 이름/접속 대상을 다시 대조한다. 도구는 대상 테이블이 존재하면 거부하며 DROP/TRUNCATE/CASCADE를 하지 않는다.

## 전환과 rollback 순서

1. **사용자에게 로컬 결과와 남은 확인 사항을 제시한 뒤 전환 시간/쓰기 중단을 별도로 승인받는다.** 기존 이미지 digest, DB 환경변수, 원본 백업, 대상 스냅샷을 보호된 위치에 보관한다.
2. 쓰기 요청을 점검 모드로 차단하고 sprit의 예약 작업/진행 중 쓰기를 모두 중단·drain한다. 다른 MariaDB 앱이나 arrive는 중단하지 않는다. 이후 스키마 변경도 금지한다.
3. 최종 MariaDB SQL 백업과 JSON 스냅샷을 새 파일로 추출한다. 임시 리허설 데이터를 운영에 재사용하지 않는다. 새 빈 sprit 대상에 전체 복사하고 테이블별 행 수·모든 값 해시·PK/FK·기본값·시간·identity 유무를 검증한다. load 후 verify를 별도로 실행한다. 실패 시 트랜잭션 rollback, MariaDB는 그대로 둔다.
4. 아직 외부 쓰기를 열지 않은 상태에서 새 이미지/접속 설정으로 앱을 시작한다. 읽기 API·건강 상태·KST·권한·arrive를 확인한다. 이 단계에서 쓰기 테스트를 해야 하면 별도 검증 DB에만 한다. 기록 없는 target 상태를 유지하면 복귀가 단순하다.
5. 모든 검증 완료 후 쓰기 경로를 PostgreSQL로 연다. 전환 시각과 최초 PostgreSQL 쓰기 시각을 기록하고 오류/로그인/예약 작업/메모리/DB 연결 수를 관찰한다. MariaDB sprit은 보존하되 다시 쓰지 않도록 유지한다.
6. **PostgreSQL 쓰기 시작 전:** 새 앱을 멈추고 이전 이미지와 MariaDB 접속으로 복구한 뒤 검증하고 쓰기를 재개할 수 있다.
7. **PostgreSQL 쓰기 시작 후:** MariaDB로 단순 접속 복귀하면 새 사용자 데이터가 유실된다. 먼저 쓰기를 다시 중단하고 PostgreSQL 최신 백업을 확보한다. 새/수정/삭제 데이터를 모두 반영하는 역이전 또는 PostgreSQL 쪽 수정 복구를 선택한다. 이 작업에서는 역이전 도구를 구현·검증하지 않았으므로 자동 fallback을 두지 않는다. 비교/충돌 해결/재검증 전에는 MariaDB 쓰기를 재개하지 않는다.

SQL 백업은 `CREATE DATABASE`/`DROP DATABASE`를 포함하지 않는 별도 DB 덤프다. 복원은 **새 격리된 MariaDB DB**에서만 먼저 수행한다. 운영 DB에 바로 restore하지 않는다. `verify-mariadb-restore.cjs`는 network-none 임시 컨테이너만 허용하고 개인정보를 출력하지 않는 값 비교 도구다.

이번 범위 밖: 운영 cutover, 실제 푸시·OAuth·S3 E2E, 운영 컨테이너 정리, MariaDB 전체 종료, arrive 설정 변경, PostgreSQL restart policy 변경, Kubernetes 설치.
