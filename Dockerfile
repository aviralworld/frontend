FROM node:14.7.0-slim AS build

# workaround for a build issue
ENV FRONTEND_API_URL=http://www.stub.com/

WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm install && pnpm run build

FROM node:14.7.0-slim AS deps

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

RUN npm i -g pnpm && pnpm i --prod

FROM node:14.7.0-slim

WORKDIR /app

COPY --from=build /app/__sapper__ ./__sapper__

COPY --from=build /app/static ./static

COPY --from=deps /app/node_modules ./node_modules

COPY .env.example .

CMD ["node", "__sapper__/build"]
