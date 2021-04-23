# Build

FROM node:alpine

WORKDIR /app

COPY package*.json ./

COPY patches ./patches

RUN npm install

COPY . .

RUN npm run build

# Production

FROM node:alpine

WORKDIR /app

COPY package*.json ./

COPY --from=0 /app/build ./build

RUN npm install --production --ignore-script

CMD node build/api/index.js --port $PORT
