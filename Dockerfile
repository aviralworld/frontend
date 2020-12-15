FROM node:14.7.0-slim

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm i -g pnpm

RUN pnpm i --prod

COPY rollup.config.js .env.example ./

COPY static static
COPY __sapper__ __sapper__

CMD ["node", "__sapper__/build"]
