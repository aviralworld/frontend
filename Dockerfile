FROM node:14.7.0-slim AS build

# workaround for build issues
ENV FRONTEND_API_URL=1
ENV FRONTEND_DEBOUNCE_DELAY_MS=1
ENV FRONTEND_ENABLE_ADMIN_MODE=1
ENV FRONTEND_RANDOM_STORY_COUNT=1
ENV FRONTEND_SERVE_STATIC=1

WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm install && pnpm run build

FROM node:14.7.0-slim AS deps

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

RUN npm i -g pnpm && pnpm i --prod

FROM node:14.7.0-slim

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ARG REVISION
ENV REVISION=$REVISION
ARG TIMESTAMP
ENV TIMESTAMP=$TIMESTAMP

WORKDIR /app

LABEL timestamp=$TIMESTAMP revision=$REVISION

COPY --from=build /app/__sapper__ ./__sapper__

COPY --from=build /app/static ./static

COPY --from=deps /app/node_modules ./node_modules

COPY .env.example .

CMD ["node", "__sapper__/build"]
