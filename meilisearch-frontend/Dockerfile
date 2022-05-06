FROM node:16-alpine

WORKDIR /app
COPY package.json package-lock.json tsconfig.json README.md next.config.js next-env.d.ts ./
COPY pages/ ./pages
COPY styles/ ./styles
COPY public/ ./public
RUN npm ci
RUN npm run build

ENTRYPOINT [ "npm","run","start" ]