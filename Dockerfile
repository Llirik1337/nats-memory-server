FROM node:18-alpine3.18
WORKDIR /usr/src
COPY . .
RUN apk add go &&\
    npm install &&\
    npm run build

