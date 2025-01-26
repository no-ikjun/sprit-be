# Node.js 이미지를 베이스로 사용
FROM node:18-alpine

# 작업 디렉토리 생성
WORKDIR /app

# 패키지 설치를 위한 package.json 복사
COPY package*.json ./

# 패키지 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 포트를 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]
