FROM node:13.10

WORKDIR /app

COPY package.json package.json 
COPY tsconfig.json tsconfig.json
COPY src src
COPY test test

RUN yarn
RUN yarn build