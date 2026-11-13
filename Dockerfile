FROM node:18.20.8-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:18.20.8-alpine
ARG SOURCE_REVISION
LABEL org.opencontainers.image.revision=$SOURCE_REVISION
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Seoul
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY scripts/migration ./scripts/migration
# Preserve CSV seed files needed by the existing location import endpoint.
COPY src/location/data ./dist/location/data
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 CMD node -e "require('http').get('http://127.0.0.1:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "dist/main.js"]
