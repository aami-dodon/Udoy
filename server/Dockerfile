FROM node:20

WORKDIR /workspace/server

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY shared /workspace/shared
COPY server/package.json server/package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install
COPY server/. .
RUN npm run prisma:generate

EXPOSE 5000

CMD ["npm", "run", "docker-dev"]
