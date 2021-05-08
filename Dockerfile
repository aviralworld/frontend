ARG NODE_VERSION
ARG BASE_IMAGE

FROM $BASE_IMAGE AS build

FROM node:$NODE_VERSION AS deps

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

RUN npm i -g pnpm && pnpm i -s --frozen-lockfile --prod

FROM node:$NODE_VERSION

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG REVISION
ARG TIMESTAMP
LABEL timestamp=$TIMESTAMP revision=$REVISION

ENV REVISION=$REVISION
ENV TIMESTAMP=$TIMESTAMP

USER 1000

WORKDIR /app

COPY --from=build /app/__sapper__ ./__sapper__

COPY --from=build /app/static ./static

COPY --from=deps /app/node_modules ./node_modules

COPY .env.example .

CMD ["node", "__sapper__/build"]
