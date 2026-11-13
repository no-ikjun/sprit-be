# PostgreSQL 운영 전환 기록

사용자가 2026-11-13 후속 지시로 데이터 보존을 전제로 운영 DB 전환과 짧은 쓰기 중단을 승인했다. Kubernetes 및 기존 DB/볼륨 삭제는 이 작업 범위 밖이다.

## 호환성 해결

- 원본 MariaDB 10.6.23의 utf8mb3_general_ci 비교 weight를 읽기 전용으로 추출했다. 지원되는 BMP 문자 63,487개 중 1,108개 mapping을 `utf8mb3-general-ci.json`에 보관한다. 개인정보는 포함하지 않는다.
- PostgreSQL의 immutable `sprit_fold(text)` 함수로 로그인 equality/PAD SPACE와 프로필 LIKE를 원본처럼 처리한다. SQL 패턴 wildcard는 그대로 보존하며 weight mapping에 %, _, backslash로 바뀌는 문자는 없다. é/e, ß/s 및 ß/ss 차이, 한글, wildcard/escape를 검증했다. supplementary 문자는 기존 utf8mb3 저장 범위 밖이며 새 데이터는 PostgreSQL UTF-8에서 처리한다.
- 중복 로그인 ID의 두 행을 모두 보존한다. 원본의 실제 LIMIT 1 선택을 스냅샷에 기록하고, PostgreSQL에서 folded PK 순서로 동일한 계정을 선택한다. 모든 기존 ID의 결과가 일치하지 않으면 importer가 transaction을 취소한다. 계정 병합/삭제/비밀번호 변경은 하지 않는다.
- 기존 앱 SQL 정렬은 날짜/숫자/거리/무작위 기준이며 locale 기반 문자열 ORDER BY가 없다. 새 로그인 tie-break만 source weight를 사용한다. 임의 관리자 SQL의 ICU 정렬은 MariaDB와 다를 수 있다.
- 같은 PostgreSQL 이미지 digest로 로컬 리허설: 14,401행 전체 해시, PK 22/FK 19/index 41, 기존 로그인 429개와 검색/패턴 421개 일치. Node18 API 검증 13개 통과. 실제 빌드 코드의 검증은 BMP 문자 전체, 모든 기존 로그인·검색 및 rollback-only password login/CRUD/UUID/FK/KST를 포함한다.

## 배포 방식과 환경 계약

- 로컬에서 linux/amd64 이미지를 multi-stage build한다. package-lock 기반 npm ci, production dependencies만 포함한다. .env/Firebase JSON/Git/개인 자료는 allowlist build context에서 제외한다.
- 컨테이너는 node 사용자로 실행하며 Node HTTP healthcheck를 사용한다. 운영 서버에서 빌드하지 않는다. registry에 push하지 않고 content-addressed Docker image를 save/load하여 실행한다.
- 코드의 CI workflow는 검증만 수행하도록 수정했다. 기존 GitHub 배포 workflow(id 140262937)는 운영 전환 전에 비활성화했다. GitHub에 코드를 push하지 않았으므로 자동배포를 다시 활성화하기 전에 반드시 새 workflow를 반영해야 한다.
- 환경: DATABASE_TYPE=postgres, DATABASE_HOST=gistag-postgres-1, DATABASE_PORT=5432, DATABASE_NAME=sprit, DATABASE_USER=sprit_app, DATABASE_PASSWORD=전용 비밀, TZ=Asia/Seoul. REHEARSAL_MODE는 preview/probe에서만 true이며 정상 운영에서는 제거한다. 기존 JWT/FCM/S3 등 값은 보존한다.
- source MariaDB 및 옛 sprit 컨테이너를 보존한다. PostgreSQL 쓰기 개방 전에는 원본 컨테이너 복귀가 가능하다. 쓰기 개방 후에는 새 PostgreSQL 데이터를 먼저 보존·조정해야 하며 단순 MariaDB 재접속 rollback을 금지한다.

## 최종 실행 결과

**운영 PostgreSQL 전환 완료: 2026-11-13 22:55:24 KST.** 공개 HTTPS /health, 인증된 기록/프로필/월간 통계 조회 모두 200. Docker healthy, restart count 0, 확인 시점 startup 이후 error log 0. arrive /health도 계속 200이었다.

- 성공한 점검 구간: 22:53:23.893–22:55:24.389 KST (약 120.5초).
- 첫 시도: 22:51:51.303–22:52:14.420 (약 23.1초). 비루트 유지보수 컨테이너가 mode-0400 스냅샷을 읽지 못해 적재 전에 EACCES로 중단됐다. 대상 테이블 0개를 확인했고, 원본 앱으로 자동 복귀했다. 실패 시도 백업은 attempt-1/에 보존했다. 일회성 유지보수 도구에만 OS root를 사용하도록 조정하고 원본을 다시 추출했다. 정상 앱은 node 사용자다. DB 권한은 유지보수/앱 role별로 제한된다.
- PostgreSQL 쓰기 가능 경계: 22:55:18.860 KST (정상 스케줄러가 있는 앱 기동 직전). 정확한 최초 사용자 쓰기 시각은 별도 audit log가 없어 확정하지 않는다. 경계 이후 자동 MariaDB fallback을 금지한다.
- 실행 이미지: `sha256:92447605124ce1e5acf471dd0d314d3d94c82cada9a22ddcee33f0b911c276a2`. 서버는 이 content-addressed ID로 실행한다.
- 로컬 OCI index digest: `sha256:0571ef6c84f30bbf35c8a4d3734978ab68052f7db85634acfaf7fec1d1e5155a`. Docker engine의 이미지 저장 방식 차이로 서버 inspect는 위 이미지 config ID를 반환한다.
- 전송 archive SHA-256: `d73861125f1a2c737045dd1c82261466ef2e7dbed90e4b05d5983dd1ba44ba45` (서버 load 전 검증).
- 배포 소스 커밋: `a91e431b324e3e8d3f3ed89671f64bf1ba970a3f`, 로컬 브랜치 `codex/sprit-postgres-cutover`. 이미지 label로 확인. 원격 Git push는 하지 않았다. 이후 운영 기록/호스트 스크립트 커밋은 이미지 소스 커밋과 구분한다.

### 최종 데이터·API 검증

최종 MariaDB 스냅샷은 22:53:35.472 KST에 추출했다. SHA-256 `aac770b17d51121cdacf95b14871241d79b4854b1b015f3131d1db42e0d429a9`.

- 22개 테이블 / 14,401행, 모든 컬럼 값 해시 일치. PK 22, validated FK 19, index 41, sequence 0.
- 기존 로그인 선택 429개, 기존 검색 및 패턴 421개 일치. 중복 ID 계정 두 행을 모두 보존하고 이전 선택 계정을 유지했다.
- 동일 PostgreSQL 이미지 로컬 API 검증 13개 묶음 통과.
- 실제 amd64 배포 이미지와 운영 preview에서 각각 6개 묶음 통과: 모든 기존 로그인, 모든 기존 검색, BMP 63,487개 weight, DDL/TRUNCATE 거부, password login/UUID/FK/KST/CRUD의 transaction rollback, 인증된 HTTP 조회.
- preview의 모든 시험 쓰기를 rollback한 뒤 최종 전체 값 해시를 다시 대조하고 쓰기를 개방했다.
- 정상 앱에 예약 작업 27개가 등록됐고 한국 시간 설정을 확인했다. 실제 사용자에게 검증용 푸시를 발송하지 않았다. 실제 외부 OAuth/S3 동작은 이번 테스트에서 호출하지 않았으며 기존 비밀값을 보존했다.
- 전환 후 PostgreSQL 백업을 로컬에 실제 복원했다. 행 누락 없이 22개 테이블 / 14,401행, PK/FK 유효성을 확인했다. 쓰기 개방 전 스냅샷과 비교 시 **book.score 8개 행만 변경**되었고 나머지 값은 일치했다. 이는 쓰기 개방 뒤 운영 데이터가 진행됐음을 의미한다. 이 백업을 이전 MariaDB 스냅샷과 동일하다고 보고하지 않는다.

### DB 격리 및 환경 계약

DB `sprit`, 앱 role `sprit_app`, 스키마 소유/이전 role `sprit_migrator`. 두 role 모두 superuser/createdb/createrole 권한 없음. 앱은 public schema USAGE와 테이블 SELECT/INSERT/UPDATE/DELETE만 가진다. 이전 role은 최종 전환 후 NOLOGIN으로 변경했다. sprit 전용 HBA 규칙을 기존 규칙보다 앞에 추가해 지정 Docker 네트워크의 sprit DB만 허용하고, arrive/gistag 및 다른 경로 접속을 거부한다. 실제 거부 검증 완료. 기존 arrive 사용자 규칙은 유지했다.

운영 env 파일: `/home/ubuntu/sprit.env` (0600). 계약 변수 이름은 `DATABASE_TYPE`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `TZ`, `NODE_ENV`, `REHEARSAL_MODE`다. 정상 운영에서는 rehearsal flag를 제거했다. JWT/FCM/S3 등의 기존 변수와 비밀값을 보존했다. **기존 `/home/ubuntu/.env` 및 GitHub ENV_FILE secret은 이전 MySQL 설정이므로 배포에 재사용하지 않는다.** 비활성화한 GitHub workflow를 다시 켜기 전에 새 검증용 workflow와 배포 secret 공급 경로를 먼저 반영해야 한다.

### 백업과 보존 위치

서버: `/home/ubuntu/sprit-postgres-cutover-20261113/` (0700). 로컬: `/Users/ikjunchoi/Documents/Coding/SPRIT/.sprit-migration-private/` (0700).

두 위치에 최종 `source-final.json`, `mariadb-final.sql.gz`, `sprit-postgres-after-cutover.dump`, 공유 PostgreSQL `shared-postgres-before-cutover.sql.gz`, `arrive-before-cutover.dump`를 보관한다. 원본 민감 자료는 0400/0600으로 보호한다. JSON과 dump에는 사용자 정보·비밀번호 해시·토큰이 포함되므로 Git/로그/채팅에 내용을 넣지 않는다. shared 백업에는 DB role 정보도 포함된다. arrive 별도 백업은 로컬 2개 테이블 복원까지 확인했다.

서버 폴더에는 원본 container inspect/env, 변경 전 nginx/HBA, 새 앱/이전 env, 배포 image archive, 단계별 시각 및 검증 보고서가 추가로 있다. 로컬에는 실제 PostgreSQL 백업 복원 비교 결과가 있다. 이 자료는 암호화 파일이 아니므로 보호된 백업 저장소와 보존 정책을 별도로 적용한다.

### 후속 정리 / k3s 담당 대화에 전달할 상태

- `sprit`은 공유 `gistag-postgres-1`의 sprit DB를 사용하며 정상 운영 중. 호스트 포트는 loopback으로만 바인딩했고 nginx가 기존 도메인을 처리한다.
- **`gistag-postgres-1` / `gistag_postgres_data`는 sprit과 arrive가 함께 사용하므로 절대 정리 대상이 아니다.**
- 원본 앱 컨테이너 `sprit-mariadb-preserved-20261113`은 stopped, restart=no 상태로 보존했다. 자동 재기동/동시 쓰기 방지. 원본 MariaDB sprit DB와 old image도 보존했다. PostgreSQL 데이터 조정 없이 이 컨테이너를 시작해 서비스 복귀하지 않는다.
- MariaDB는 계속 실행 중이다. 점검 시 원본 DB 연결은 0개였으나 `agora` 2테이블, `analyst` 7테이블, 원본 `sprit` 22테이블이 남아 있다. 현재 연결 0개는 배치/간헐적 소비자가 없다는 증거가 아니므로 후속 대화에서 확인한 뒤 중단한다.
- gistag 앱, 구형 `gistag-be-postgres-1` 및 모든 기존 볼륨은 이번 작업에서 중단/삭제하지 않았다. Kubernetes를 설치하지 않았다.
- 전환 후 메모리: total 1,930MiB / used 약 1,208MiB / available 약 **452MiB**, swap 없음. 디스크 약 **9.1GB 여유**. 공유 PG restart policy 변경은 수행하지 않았다.
- nginx에는 `/run/sprit-maintenance.flag` 존재 시 sprit 도메인만 503을 내는 guard가 남아 있다. 현재 flag는 없다. 다른 도메인은 변경하지 않았다.
- 후속 장애 시 현재 PostgreSQL부터 백업하고 복구/역이전 계획을 세운다. PostgreSQL 쓰기 시작 이후 MariaDB로 단순 연결 변경은 데이터 유실을 유발한다.
