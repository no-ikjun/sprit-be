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

전환 실행 후 검증 시각, immutable image, 백업 위치, 권한 및 메모리 결과를 여기에 추가한다.
