FROM node:16-alpine

COPY package.json package-lock.json download.js ./
RUN apk add p7zip
RUN npm ci

ENTRYPOINT [ "npm", "start" ]